package com.example.app.api.payment;

public record CheckoutPaymentStatusResponse(
        String paymentIntentId,
        String status,
        String errorMessage,
        int fulfilledTickets
) {
}

