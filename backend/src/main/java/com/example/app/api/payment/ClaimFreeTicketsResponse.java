package com.example.app.api.payment;

import java.util.UUID;

public record ClaimFreeTicketsResponse(
        UUID eventId,
        int claimedTickets
) {
}

