package com.example.app.api.event;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String title,
        String description,
        String category,
        String venue,
        String imageUrl,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        int capacity,
        int seatsSold,
        int remainingSeats,
        boolean soldOut,
        BigDecimal price,
        String status,
        UUID organizerId,
        Long version,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
