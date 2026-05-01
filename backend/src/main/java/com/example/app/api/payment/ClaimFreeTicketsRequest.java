package com.example.app.api.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ClaimFreeTicketsRequest(
        @NotNull(message = "Event id is required")
        UUID eventId,
        @Min(value = 1, message = "Quantity must be at least 1")
        int quantity
) {
}

