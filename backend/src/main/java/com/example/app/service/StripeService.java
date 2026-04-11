package com.example.app.service;

import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    /**
     * Create a payment intent
     * @param amount amount in cents
     * @param currency currency code (e.g., "usd")
     * @return the created PaymentIntent
     */
    public PaymentIntent createPaymentIntent(Long amount, String currency) {
        try {
            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setAmount(amount)
                            .setCurrency(currency)
                            .build();

            return PaymentIntent.create(params);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create payment intent", e);
        }
    }

    /**
     * Retrieve a payment intent
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
}
