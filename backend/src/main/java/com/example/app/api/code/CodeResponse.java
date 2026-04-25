package com.example.app.api.code;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CodeResponse(
        UUID id,
        int scanCount,
        String qrData,
        CodeUserResponse user,
        CodeEventResponse event,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
