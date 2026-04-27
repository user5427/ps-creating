package com.example.app.service;

import com.example.app.config.StripeConfig;
import com.example.app.domain.payment.CheckoutPaymentService;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    private final StripeConfig stripeConfig;
    private final CheckoutPaymentService checkoutPaymentService;

    public StripeService(StripeConfig stripeConfig,
                         CheckoutPaymentService checkoutPaymentService) {
        this.stripeConfig = stripeConfig;
        this.checkoutPaymentService = checkoutPaymentService;
    }

    /**
     * Create a payment intent.
     *
     * @param amount amount in cents
     * @param currency currency code (e.g., "eur")
     * @param metadata payment metadata used by webhook fulfillment
     * @return created PaymentIntent
     */
    public PaymentIntent createPaymentIntent(Long amount, String currency, Map<String, String> metadata) {
        try {
            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setAmount(amount)
                            .setCurrency(currency)
                            .putAllMetadata(metadata)
                            .setAutomaticPaymentMethods(
                                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                            .setEnabled(true)
                                            .build())
                            .build();

            return PaymentIntent.create(params);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create payment intent", e);
        }
    }

    /**
     * Retrieve a payment intent.
     *
     * @param intentId the payment intent ID
     * @return the PaymentIntent
     */
    public PaymentIntent retrievePaymentIntent(String intentId) {
        try {
            return PaymentIntent.retrieve(intentId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve payment intent", e);
        }
    }

    public boolean handleWebhook(String payload, String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isBlank()) {
            return false;
        }

        Event event;
        try {
            event = constructWebhookEvent(payload, signatureHeader);
        } catch (RuntimeException ex) {
            return false;
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            handlePaymentIntent(event, true);
        }

        if ("payment_intent.payment_failed".equals(event.getType())) {
            handlePaymentIntent(event, false);
        }

        return true;
    }

    public Event constructWebhookEvent(String payload, String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new RuntimeException("Missing Stripe signature header");
        }
        try {
            return Webhook.constructEvent(payload, signatureHeader, stripeConfig.getStripeWebhookSecret());
        } catch (SignatureVerificationException e) {
            throw new RuntimeException("Invalid Stripe webhook signature", e);
        }
    }

    private void handlePaymentIntent(Event event, boolean succeeded) {
        PaymentIntent intent = extractPaymentIntent(event);
        if (intent == null) {
            return;
        }

        if (succeeded) {
            checkoutPaymentService.handlePaymentSucceeded(intent.getId());
            return;
        }

        String message = intent.getLastPaymentError() == null
                ? "Payment was declined"
                : intent.getLastPaymentError().getMessage();
        checkoutPaymentService.handlePaymentFailed(intent.getId(), message);
    }

    private PaymentIntent extractPaymentIntent(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isPresent() && deserializer.getObject().get() instanceof PaymentIntent intent) {
            return intent;
        }

        try {
            if (deserializer.deserializeUnsafe() instanceof PaymentIntent intent) {
                return intent;
            }
        } catch (EventDataObjectDeserializationException ignored) {
            return null;
        }

        return null;
    }
}
