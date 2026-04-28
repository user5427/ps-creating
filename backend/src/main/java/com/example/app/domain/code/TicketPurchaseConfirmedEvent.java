package com.example.app.domain.code;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketPurchaseConfirmedEvent(
        String recipientEmail,
        String recipientFirstName,
        String eventTitle,
        String eventVenue,
        OffsetDateTime eventStartTime,
        UUID ticketId,
        String qrPayload
) {}