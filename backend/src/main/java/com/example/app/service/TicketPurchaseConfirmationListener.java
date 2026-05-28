package com.example.app.service;

import com.example.app.domain.code.TicketPurchaseConfirmedEvent;
import java.time.format.DateTimeFormatter;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.util.StringUtils;

@Component
public class TicketPurchaseConfirmationListener {

    private static final DateTimeFormatter SMS_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm XXX");

    private final TicketEmailService ticketEmailService;
    private final TwilioService twilioService;

    public TicketPurchaseConfirmationListener(TicketEmailService ticketEmailService,
                                              TwilioService twilioService) {
        this.ticketEmailService = ticketEmailService;
        this.twilioService = twilioService;
    }

    @Async("eventTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(TicketPurchaseConfirmedEvent event) {
        ticketEmailService.sendTicketConfirmation(new TicketConfirmationEmail(
                event.recipientEmail(),
                event.recipientFirstName(),
                event.eventTitle(),
                event.eventVenue(),
                event.eventStartTime(),
                event.ticketId(),
                event.qrPayload()));

        if (StringUtils.hasText(event.recipientPhoneNumber())) {
            try {
                twilioService.sendSMS(event.recipientPhoneNumber(), buildSmsPurchaseConfirmation(event));
            } catch (Exception ex) {
                // swallow send errors to avoid blocking ticket confirmations
            }
        }
    }

    private static String buildSmsPurchaseConfirmation(TicketPurchaseConfirmedEvent event) {
        return "Ticket confirmed: %s at %s on %s. Ticket ID: %s."
                .formatted(
                        event.eventTitle(),
                        event.eventVenue(),
                        SMS_TIME_FORMAT.format(event.eventStartTime()),
                        event.ticketId());
    }
}