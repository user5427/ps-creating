package com.example.app.service;

import com.example.app.config.StripeConfig;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    private final StripeConfig stripeConfig;

    public StripeService(StripeConfig stripeConfig) {
        this.stripeConfig = stripeConfig;
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
}
