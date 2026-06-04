package com.example.app.service;

import com.example.app.util.QrImageUtils;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Attachments;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SmtpTicketEmailService implements TicketEmailService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final SendGrid sendGrid;
    private final String sendGridApiKey;
    private final QrImageUtils qrImageUtils;
    private final String fromAddress;

    public SmtpTicketEmailService(QrImageUtils qrImageUtils,
            @Value("${app.mail.from:no-reply@app.local}") String fromAddress,
            @Value("${app.mail.sendgrid-api-key:}") String sendGridApiKey) {
        this.qrImageUtils = qrImageUtils;
        this.fromAddress = fromAddress;
        this.sendGridApiKey = sendGridApiKey;
        this.sendGrid = new SendGrid(sendGridApiKey);
    }

    @Override
    public void sendTicketConfirmation(TicketConfirmationEmail confirmation) {
        try {
            byte[] qrPng = Objects.requireNonNull(qrImageUtils.createPng(confirmation.qrPayload(), 300));
            String qrBase64 = Base64.getEncoder().encodeToString(qrPng);
            String qrDataUri = "data:image/png;base64," + qrBase64;

            String htmlBody = buildHtmlBody(confirmation, qrDataUri);
            Mail mail = buildBaseMail(
                    confirmation.recipientEmail(),
                    "Your ticket confirmation: " + confirmation.eventTitle(),
                    htmlBody);

            Attachments attachment = new Attachments();
            attachment.setContent(qrBase64);
            attachment.setType("image/png");
            attachment.setFilename("ticket-qr.png");
            attachment.setDisposition("attachment");
            mail.addAttachments(attachment);

            sendEmail(mail);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to send ticket confirmation email", ex);
        }
    }

    @Override
    public void sendEventReminder(EventReminderEmail reminder) {
        try {
            String start = DATE_FORMAT.format(reminder.eventStartTime());
            String htmlBody = """
                    <html>
                      <body style=\"font-family: Arial, sans-serif; color: #1f2937;\">
                        <h2>Event reminder</h2>
                        <p>Hello %s,</p>
                        <p>This is a tiny reminder that you have a ticket for the following event happening in %s:</p>
                                                <p><strong>Event:</strong> %s</p>
                        <p><strong>Venue:</strong> %s</p>
                        <p><strong>Start time:</strong> %s</p>
                      </body>
                    </html>
                    """.formatted(reminder.recipientFirstName(), start, reminder.eventTitle(), reminder.eventVenue(), start);

            Mail mail = buildBaseMail(
                    reminder.recipientEmail(),
                    "Event reminder: " + reminder.eventTitle(),
                    htmlBody);
            sendEmail(mail);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to send event reminder email", ex);
        }
    }

    private Mail buildBaseMail(String recipientEmail, String subject, String htmlBody) {
        Email from = new Email(Objects.requireNonNull(fromAddress));
        Mail mail = new Mail();
        mail.setFrom(from);
        mail.setSubject(subject);
        mail.addContent(new Content("text/html", Objects.requireNonNull(htmlBody)));

        Personalization personalization = new Personalization();
        personalization.addTo(new Email(Objects.requireNonNull(recipientEmail)));
        mail.addPersonalization(personalization);
        return mail;
    }

    private void sendEmail(Mail mail) throws Exception {
        if (!StringUtils.hasText(sendGridApiKey)) {
            throw new IllegalStateException("SENDGRID_API_KEY is not configured");
        }

        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sendGrid.api(request);
        if (response.getStatusCode() >= 400) {
            throw new IllegalStateException("SendGrid mail failed with status " + response.getStatusCode());
        }
    }

    private static String buildHtmlBody(TicketConfirmationEmail confirmation, String qrDataUri) {
        String start = DATE_FORMAT.format(confirmation.eventStartTime());
        return """
                <html>
                  <body style=\"font-family: Arial, sans-serif; color: #1f2937;\">
                    <h2>Ticket confirmed</h2>
                                        <p>Hello %s,</p>
                    <p>Your payment has been processed and your ticket is ready.</p>
                    <p><strong>Event:</strong> %s</p>
                    <p><strong>Venue:</strong> %s</p>
                    <p><strong>Start time:</strong> %s</p>
                    <p><strong>Ticket ID:</strong> %s</p>
                    <p>Show this QR code at venue entry:</p>
                                        <p><img src=\"%s\" alt=\"Ticket QR code\" width=\"300\" height=\"300\" /></p>
                    <p style=\"font-size: 12px; color: #6b7280;\">QR payload: %s</p>
                  </body>
                </html>
                """.formatted(
                confirmation.recipientFirstName(),
                confirmation.eventTitle(),
                confirmation.eventVenue(),
                start,
                confirmation.ticketId(),
                qrDataUri,
                confirmation.qrPayload());
    }
}
