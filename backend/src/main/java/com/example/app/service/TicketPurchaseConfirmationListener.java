package com.example.app.service;

import com.example.app.domain.code.TicketPurchaseConfirmedEvent;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class TicketPurchaseConfirmationListener {

    private final TicketEmailService ticketEmailService;

    public TicketPurchaseConfirmationListener(TicketEmailService ticketEmailService) {
        this.ticketEmailService = ticketEmailService;
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
    }
}