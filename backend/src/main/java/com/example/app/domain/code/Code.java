package com.example.app.domain.code;

import com.example.app.domain.event.Event;
import com.example.app.domain.user.User;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "codes",
        indexes = {
                @Index(name = "idx_codes_created_at", columnList = "created_at")
        }
)
public class Code {

    @Id
    private UUID id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "event_id", nullable = false)
        private Event event;

    @Column(name = "scan_count", nullable = false)
    private Integer scanCount = 0;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Code() {}

    public Code(UUID id) {
        this.id = id;
    }

    public Code(UUID id, User user, Event event) {
        this.id = id;
        this.user = user;
        this.event = event;
    }

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (scanCount == null) {
            scanCount = 0;
        }
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }

    public User getUser() { return user; }

    public Event getEvent() { return event; }

    public Integer getScanCount() { return scanCount; }

    public Long getVersion() { return version; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public void setUser(User user) { this.user = user; }

    public void setEvent(Event event) { this.event = event; }

    public void incrementScanCount() {
        scanCount = scanCount + 1;
    }
}
