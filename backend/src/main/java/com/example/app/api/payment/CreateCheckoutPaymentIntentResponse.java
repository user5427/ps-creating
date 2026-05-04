package com.example.app.api.payment;

public record CreateCheckoutPaymentIntentResponse(
        String paymentIntentId,
        String clientSecret,
        long amount,
        String currency,
        int quantity
) {
}

