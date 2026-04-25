package com.example.app.api.code;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CodeEventResponse(
        UUID id,
        String title,
        String venue,
        OffsetDateTime startTime,
        OffsetDateTime endTime
) {}
