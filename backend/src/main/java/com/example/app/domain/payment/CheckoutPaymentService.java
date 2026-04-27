package com.example.app.domain.payment;

import com.example.app.api.payment.CheckoutPaymentStatusResponse;
import com.example.app.api.payment.CreateCheckoutPaymentIntentResponse;
import java.util.UUID;

public interface CheckoutPaymentService {

    CreateCheckoutPaymentIntentResponse createPaymentIntent(UUID eventId, UUID attendeeId, int quantity);

    CheckoutPaymentStatusResponse status(String paymentIntentId, UUID actorId, boolean actorIsOrganizer);

    void handlePaymentSucceeded(String paymentIntentId);

    void handlePaymentFailed(String paymentIntentId, String errorMessage);
}

