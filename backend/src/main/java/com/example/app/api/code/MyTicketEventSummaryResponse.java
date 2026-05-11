package com.example.app.api.code;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MyTicketEventSummaryResponse(
        UUID eventId,
        String eventTitle,
        OffsetDateTime eventStartTime,
        OffsetDateTime eventEndTime,
        int ticketQuantity
) {}

