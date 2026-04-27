package com.example.app.domain.payment;

import com.example.app.config.StripeConfig;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks")
public class StripeWebhookController {

    private final StripeConfig stripeConfig;
    private final CheckoutPaymentService checkoutPaymentService;

    public StripeWebhookController(StripeConfig stripeConfig,
                                   CheckoutPaymentService checkoutPaymentService) {
        this.stripeConfig = stripeConfig;
        this.checkoutPaymentService = checkoutPaymentService;
    }

    @PostMapping("/stripe")
    public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload,
                                                    HttpServletRequest request) {
        String signature = request.getHeader("Stripe-Signature");
        if (signature == null || signature.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, stripeConfig.getStripeWebhookSecret());
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            handlePaymentIntent(event, true);
        }

        if ("payment_intent.payment_failed".equals(event.getType())) {
            handlePaymentIntent(event, false);
        }

        return ResponseEntity.ok().build();
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
