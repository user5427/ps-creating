package com.example.app.api.event;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record EventDashboardResponse(
        UUID id,
        String title,
        String description,
        String category,
        String venue,
        String imageUrl,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        int capacity,
        int ticketsSold,
        int remainingCapacity,
        BigDecimal price,
        BigDecimal totalRevenue,
        String status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private UUID id;
        private String title;
        private String description;
        private String category;
        private String venue;
        private String imageUrl;
        private OffsetDateTime startTime;
        private OffsetDateTime endTime;
        private int capacity;
        private int ticketsSold;
        private int remainingCapacity;
        private BigDecimal price;
        private BigDecimal totalRevenue;
        private String status;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        public Builder id(UUID v) { this.id = v; return this; }
        public Builder title(String v) { this.title = v; return this; }
        public Builder description(String v) { this.description = v; return this; }
        public Builder category(String v) { this.category = v; return this; }
        public Builder venue(String v) { this.venue = v; return this; }
        public Builder imageUrl(String v) { this.imageUrl = v; return this; }
        public Builder startTime(OffsetDateTime v) { this.startTime = v; return this; }
        public Builder endTime(OffsetDateTime v) { this.endTime = v; return this; }
        public Builder capacity(int v) { this.capacity = v; return this; }
        public Builder ticketsSold(int v) { this.ticketsSold = v; return this; }
        public Builder remainingCapacity(int v) { this.remainingCapacity = v; return this; }
        public Builder price(BigDecimal v) { this.price = v; return this; }
        public Builder totalRevenue(BigDecimal v) { this.totalRevenue = v; return this; }
        public Builder status(String v) { this.status = v; return this; }
        public Builder createdAt(OffsetDateTime v) { this.createdAt = v; return this; }
        public Builder updatedAt(OffsetDateTime v) { this.updatedAt = v; return this; }

        public EventDashboardResponse build() {
            return new EventDashboardResponse(
                    id, title, description, category, venue, imageUrl,
                    startTime, endTime, capacity, ticketsSold, remainingCapacity,
                    price, totalRevenue, status, createdAt, updatedAt);
        }
    }
}
