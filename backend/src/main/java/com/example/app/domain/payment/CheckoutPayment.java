package com.example.app.domain.payment;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "checkout_payments",
        indexes = {
                @Index(name = "idx_checkout_payments_event_id", columnList = "event_id"),
                @Index(name = "idx_checkout_payments_attendee_id", columnList = "attendee_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_checkout_payments_intent", columnNames = "payment_intent_id")
        }
)
public class CheckoutPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "attendee_id", nullable = false)
    private UUID attendeeId;

    @Column(name = "payment_intent_id", nullable = false, length = 64)
    private String paymentIntentId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "amount_cents", nullable = false)
    private Long amountCents;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CheckoutPaymentStatus status = CheckoutPaymentStatus.INITIATED;

    @Column(name = "failure_message", length = 500)
    private String failureMessage;

    @Column(name = "fulfilled_at")
    private OffsetDateTime fulfilledAt;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected CheckoutPayment() {
    }

    public CheckoutPayment(UUID eventId,
                           UUID attendeeId,
                           String paymentIntentId,
                           Integer quantity,
                           Long amountCents,
                           String currency) {
        this.eventId = eventId;
        this.attendeeId = attendeeId;
        this.paymentIntentId = paymentIntentId;
        this.quantity = quantity;
        this.amountCents = amountCents;
        this.currency = currency;
    }

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getEventId() {
        return eventId;
    }

    public UUID getAttendeeId() {
        return attendeeId;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Long getAmountCents() {
        return amountCents;
    }

    public String getCurrency() {
        return currency;
    }

    public CheckoutPaymentStatus getStatus() {
        return status;
    }

    public String getFailureMessage() {
        return failureMessage;
    }

    public OffsetDateTime getFulfilledAt() {
        return fulfilledAt;
    }

    public Long getVersion() {
        return version;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void markPaymentSucceeded() {
        status = CheckoutPaymentStatus.PAYMENT_SUCCEEDED;
        failureMessage = null;
    }

    public void markFailed(String message) {
        status = CheckoutPaymentStatus.FAILED;
        failureMessage = message;
    }

    public void markFulfilled() {
        status = CheckoutPaymentStatus.FULFILLED;
        failureMessage = null;
        fulfilledAt = OffsetDateTime.now();
    }
}
