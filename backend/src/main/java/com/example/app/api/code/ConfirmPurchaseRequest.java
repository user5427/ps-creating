package com.example.app.api.code;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ConfirmPurchaseRequest(
        @NotNull UUID eventId,
        @NotBlank String paymentIntentId
) {}