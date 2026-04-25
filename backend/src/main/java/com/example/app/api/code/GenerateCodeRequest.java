package com.example.app.api.code;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record GenerateCodeRequest(
        UUID id,
        @NotNull UUID userId,
        @NotNull UUID eventId
) {}
