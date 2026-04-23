package com.example.app.domain.event;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "events",
        indexes = {
                @Index(name = "idx_events_status_start_time", columnList = "status, start_time"),
                @Index(name = "idx_events_organizer", columnList = "organizer_id")
        }
)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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
    private UUID organizerId;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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

    protected Event() {}

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

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getVenue() { return venue; }
    public String getImageUrl() { return imageUrl; }
    public OffsetDateTime getStartTime() { return startTime; }
    public OffsetDateTime getEndTime() { return endTime; }
    public Integer getCapacity() { return capacity; }
    public Integer getSeatsSold() { return seatsSold; }
    public BigDecimal getPrice() { return price; }
    public EventStatus getStatus() { return status; }
    public UUID getOrganizerId() { return organizerId; }
    public Long getVersion() { return version; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public int getRemainingSeats() {
        return Math.max(0, capacity - seatsSold);
    }

    public boolean isSoldOut() {
        return seatsSold >= capacity;
    }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCategory(String category) { this.category = category; }
    public void setVenue(String venue) { this.venue = venue; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setStartTime(OffsetDateTime startTime) { this.startTime = startTime; }
    public void setEndTime(OffsetDateTime endTime) { this.endTime = endTime; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public void setSeatsSold(Integer seatsSold) { this.seatsSold = seatsSold; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setStatus(EventStatus status) { this.status = status; }
}
