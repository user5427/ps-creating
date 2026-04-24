package com.example.app.domain.event;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "events",
        indexes = {
                @Index(name = "idx_events_status_start_time", columnList = "status, start_time"),
                @Index(name = "idx_events_organizer", columnList = "organizer_id")
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(nullable = false, length = 200)
    private String venue;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private OffsetDateTime endTime;

    @Column(nullable = false)
    private Integer capacity;

    // Denormalized counter for sold-out UX until Ticket aggregate lands.
    // TODO: recompute from tickets once US-04/05/06 are implemented.
    @Column(name = "seats_sold", nullable = false)
    private Integer seatsSold = 0;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private EventStatus status = EventStatus.PUBLISHED;

    @Column(name = "organizer_id", nullable = false)
    @Setter(AccessLevel.NONE)
    private UUID organizerId;

    @Version
    @Setter(AccessLevel.NONE)
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Setter(AccessLevel.NONE)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @Setter(AccessLevel.NONE)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public Event(String title, String description, String category, String venue,
                 String imageUrl, OffsetDateTime startTime, OffsetDateTime endTime,
                 Integer capacity, BigDecimal price, UUID organizerId) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.venue = venue;
        this.imageUrl = imageUrl;
        this.startTime = startTime;
        this.endTime = endTime;
        this.capacity = capacity;
        this.price = price;
        this.organizerId = organizerId;
    }

    public int getRemainingSeats() {
        return Math.max(0, capacity - seatsSold);
    }

    public boolean isSoldOut() {
        return seatsSold >= capacity;
    }
}
