package com.example.app.api.payment;

import jakarta.validation.constraints.Min;

public record CreateCheckoutPaymentIntentRequest(
        @Min(value = 1, message = "Quantity must be at least 1")
        int quantity
) {
}

