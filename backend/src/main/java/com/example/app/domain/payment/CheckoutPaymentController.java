package com.example.app.domain.payment;

import com.example.app.api.payment.ClaimFreeTicketsRequest;
import com.example.app.api.payment.ClaimFreeTicketsResponse;
import com.example.app.api.payment.CheckoutPaymentStatusResponse;
import com.example.app.api.payment.CreateCheckoutPaymentIntentRequest;
import com.example.app.api.payment.CreateCheckoutPaymentIntentResponse;
import com.example.app.web.ActorContext;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CheckoutPaymentController {

    private final CheckoutPaymentService checkoutPaymentService;
    private final ActorContext actorContext;

    public CheckoutPaymentController(CheckoutPaymentService checkoutPaymentService, ActorContext actorContext) {
        this.checkoutPaymentService = checkoutPaymentService;
        this.actorContext = actorContext;
    }

    @PostMapping("/events/{eventId}/checkout/payment-intents")
    public CreateCheckoutPaymentIntentResponse createPaymentIntent(@PathVariable UUID eventId,
                                                                   @Valid @RequestBody CreateCheckoutPaymentIntentRequest request) {
        requireAttendee();
        return checkoutPaymentService.createPaymentIntent(eventId, actorContext.getActorId(), request.quantity());
    }

    @PostMapping("/tickets/claim-free")
    public ClaimFreeTicketsResponse claimFree(@Valid @RequestBody ClaimFreeTicketsRequest request) {
        requireAttendee();
        return checkoutPaymentService.claimFreeTickets(
                request.eventId(),
                actorContext.getActorId(),
                request.quantity());
    }

    @GetMapping("/checkout/payment-intents/{paymentIntentId}")
    public CheckoutPaymentStatusResponse status(@PathVariable String paymentIntentId) {
        return checkoutPaymentService.status(paymentIntentId, actorContext.getActorId(), actorContext.isOrganizer());
    }

    private void requireAttendee() {
        if (actorContext.isOrganizer()) {
            throw new CheckoutAccessDeniedException("Only attendees can purchase tickets");
        }
    }
}
