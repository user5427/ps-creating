package com.example.app.service;

import com.example.app.domain.event.Event;
import com.example.app.domain.user.User;
import com.example.app.util.QrImageUtils;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class SmtpTicketEmailService implements TicketEmailService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm XXX");

    private final JavaMailSender mailSender;
    private final QrImageUtils qrImageUtils;
    private final String fromAddress;

    public SmtpTicketEmailService(JavaMailSender mailSender,
                                  QrImageUtils qrImageUtils,
                                  @Value("${app.mail.from:no-reply@app.local}") String fromAddress) {
        this.mailSender = mailSender;
        this.qrImageUtils = qrImageUtils;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendTicketConfirmation(User user, Event event, UUID ticketId, String qrPayload) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

                helper.setFrom(Objects.requireNonNull(fromAddress));
                helper.setTo(Objects.requireNonNull(user.getEmail()));
            helper.setSubject("Your ticket confirmation: " + event.getTitle());

                byte[] qrPng = Objects.requireNonNull(qrImageUtils.createPng(qrPayload, 300));
                String qrDataUri = "data:image/png;base64," + Base64.getEncoder().encodeToString(qrPng);

                String htmlBody = buildHtmlBody(user, event, ticketId, qrPayload, qrDataUri);
                helper.setText(Objects.requireNonNull(htmlBody), true);

            helper.addAttachment("ticket-qr.png", new ByteArrayResource(qrPng), "image/png");

            mailSender.send(message);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to send ticket confirmation email", ex);
        }
    }

    private static String buildHtmlBody(User user,
                                        Event event,
                                        UUID ticketId,
                                        String qrPayload,
                                        String qrDataUri) {
        String start = DATE_FORMAT.format(event.getStartTime());
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
                user.getFirstName(),
                event.getTitle(),
                event.getVenue(),
                start,
                ticketId,
                                qrDataUri,
                qrPayload);
    }
}
