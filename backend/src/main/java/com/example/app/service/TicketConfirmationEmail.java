package com.example.app.service;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketConfirmationEmail(
        String recipientEmail,
        String recipientFirstName,
        String eventTitle,
        String eventVenue,
        OffsetDateTime eventStartTime,
        UUID ticketId,
        String qrPayload
) {}