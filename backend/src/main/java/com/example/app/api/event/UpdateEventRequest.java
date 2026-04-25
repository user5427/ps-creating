package com.example.app.api.event;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.hibernate.validator.constraints.URL;

public record UpdateEventRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        @NotBlank @Size(max = 64) String category,
        @NotBlank @Size(max = 200) String venue,
        @URL @Size(max = 500) String imageUrl,
        @NotNull OffsetDateTime startTime,
        @NotNull OffsetDateTime endTime,
        @NotNull @Min(1) Integer capacity,
        @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal price,
        @NotNull Long version
) {
    @AssertTrue(message = "endTime must be after startTime")
    public boolean isEndAfterStart() {
        return startTime == null || endTime == null || endTime.isAfter(startTime);
    }
}
