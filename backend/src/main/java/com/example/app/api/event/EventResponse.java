package com.example.app.api.event;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String title,
        String description,
        String category,
        String venue,
        String imageUrl,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        int capacity,
        int seatsSold,
        int remainingSeats,
        boolean soldOut,
        BigDecimal price,
        String status,
        UUID organizerId,
        Long version,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    public static Builder builder() {
        return new Builder();
    }

    /**
     * Named builder so the mapper constructs the record by field name instead of an
     * 18-argument positional constructor. Adding/reordering record components no
     * longer silently shuffles call-site values. Hand-written because Lombok's
     * {@code @Builder} on records doesn't initialize cleanly on the current JDK.
     */
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
        private int seatsSold;
        private int remainingSeats;
        private boolean soldOut;
        private BigDecimal price;
        private String status;
        private UUID organizerId;
        private Long version;
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
        public Builder seatsSold(int v) { this.seatsSold = v; return this; }
        public Builder remainingSeats(int v) { this.remainingSeats = v; return this; }
        public Builder soldOut(boolean v) { this.soldOut = v; return this; }
        public Builder price(BigDecimal v) { this.price = v; return this; }
        public Builder status(String v) { this.status = v; return this; }
        public Builder organizerId(UUID v) { this.organizerId = v; return this; }
        public Builder version(Long v) { this.version = v; return this; }
        public Builder createdAt(OffsetDateTime v) { this.createdAt = v; return this; }
        public Builder updatedAt(OffsetDateTime v) { this.updatedAt = v; return this; }

        public EventResponse build() {
            return new EventResponse(id, title, description, category, venue, imageUrl,
                    startTime, endTime, capacity, seatsSold, remainingSeats, soldOut,
                    price, status, organizerId, version, createdAt, updatedAt);
        }
    }
}
