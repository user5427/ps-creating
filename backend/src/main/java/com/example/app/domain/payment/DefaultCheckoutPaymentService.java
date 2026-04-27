package com.example.app.domain.payment;

import com.example.app.api.payment.CheckoutPaymentStatusResponse;
import com.example.app.api.payment.CreateCheckoutPaymentIntentResponse;
import com.example.app.domain.code.Code;
import com.example.app.domain.code.CodeRepository;
import com.example.app.domain.event.Event;
import com.example.app.domain.event.EventNotFoundException;
import com.example.app.domain.event.EventRepository;
import com.example.app.domain.pricing.PricingStrategy;
import com.example.app.domain.user.User;
import com.example.app.domain.user.UserRepository;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DefaultCheckoutPaymentService implements CheckoutPaymentService {

    private static final String CURRENCY = "eur";

    private final CheckoutPaymentRepository checkoutPaymentRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final CodeRepository codeRepository;
    private final PricingStrategy pricingStrategy;

    public DefaultCheckoutPaymentService(CheckoutPaymentRepository checkoutPaymentRepository,
                                         EventRepository eventRepository,
                                         UserRepository userRepository,
                                         CodeRepository codeRepository,
                                         PricingStrategy pricingStrategy) {
        this.checkoutPaymentRepository = checkoutPaymentRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.codeRepository = codeRepository;
        this.pricingStrategy = pricingStrategy;
    }

    @Override
    public CreateCheckoutPaymentIntentResponse createPaymentIntent(UUID eventId, UUID attendeeId, int quantity) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));
        User attendee = userRepository.findById(attendeeId)
                .orElseThrow(() -> new CheckoutAccessDeniedException("Attendee does not exist: " + attendeeId));

        if (quantity > event.getRemainingSeats()) {
            throw new IllegalStateException("Not enough remaining seats for this purchase");
        }

        long unitAmount = toCents(pricingStrategy.displayPrice(event));
        long amount = unitAmount * quantity;

        Map<String, String> metadata = Map.of(
                "eventId", eventId.toString(),
                "attendeeId", attendeeId.toString(),
                "quantity", Integer.toString(quantity)
        );

        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amount)
                        .setCurrency(CURRENCY)
                        .putAllMetadata(metadata)
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                        .setEnabled(true)
                                        .build())
                        .build();

        PaymentIntent paymentIntent;
        try {
            paymentIntent = PaymentIntent.create(params);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create payment intent", e);
        }

        CheckoutPayment checkoutPayment = new CheckoutPayment(
                eventId,
                attendee.getId(),
                paymentIntent.getId(),
                quantity,
                amount,
                CURRENCY
        );
        checkoutPaymentRepository.save(checkoutPayment);

        return new CreateCheckoutPaymentIntentResponse(
                paymentIntent.getId(),
                paymentIntent.getClientSecret(),
                amount,
                CURRENCY,
                quantity
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CheckoutPaymentStatusResponse status(String paymentIntentId, UUID actorId, boolean actorIsOrganizer) {
        CheckoutPayment payment = checkoutPaymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment intent does not exist: " + paymentIntentId));

        if (!actorIsOrganizer && !payment.getAttendeeId().equals(actorId)) {
            throw new CheckoutAccessDeniedException("You can only view your own payment status");
        }

        int fulfilledTickets = payment.getStatus() == CheckoutPaymentStatus.FULFILLED ? payment.getQuantity() : 0;
        return new CheckoutPaymentStatusResponse(
                payment.getPaymentIntentId(),
                payment.getStatus().name(),
                payment.getFailureMessage(),
                fulfilledTickets
        );
    }

    @Override
    public void handlePaymentSucceeded(String paymentIntentId) {
        checkoutPaymentRepository.findByPaymentIntentId(paymentIntentId)
                .ifPresent(payment -> {
                    if (payment.getStatus() == CheckoutPaymentStatus.FULFILLED) {
                        return;
                    }

                    Event event = eventRepository.findByIdForUpdate(payment.getEventId())
                            .orElseThrow(() -> new EventNotFoundException(payment.getEventId()));

                    if (event.getRemainingSeats() < payment.getQuantity()) {
                        payment.markFailed("Payment succeeded but tickets are sold out. Please contact support.");
                        checkoutPaymentRepository.save(payment);
                        return;
                    }

                    User attendee = userRepository.findById(payment.getAttendeeId())
                            .orElseThrow(() -> new CheckoutAccessDeniedException(
                                    "Attendee does not exist: " + payment.getAttendeeId()));

                    List<Code> createdCodes = new ArrayList<>();
                    for (int i = 0; i < payment.getQuantity(); i++) {
                        createdCodes.add(new Code(UUID.randomUUID(), attendee, event));
                    }
                    codeRepository.saveAll(createdCodes);

                    event.setSeatsSold(event.getSeatsSold() + payment.getQuantity());
                    eventRepository.save(event);

                    payment.markPaymentSucceeded();
                    payment.markFulfilled();
                    checkoutPaymentRepository.save(payment);
                });
    }

    @Override
    public void handlePaymentFailed(String paymentIntentId, String errorMessage) {
        checkoutPaymentRepository.findByPaymentIntentId(paymentIntentId)
                .ifPresent(payment -> {
                    if (payment.getStatus() == CheckoutPaymentStatus.FULFILLED) {
                        return;
                    }
                    payment.markFailed(errorMessage == null ? "Payment failed" : errorMessage);
                    checkoutPaymentRepository.save(payment);
                });
    }

    private static long toCents(BigDecimal amount) {
        return amount
                .setScale(2, RoundingMode.HALF_UP)
                .movePointRight(2)
                .longValueExact();
    }
}

