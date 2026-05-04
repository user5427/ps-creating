package com.example.app.domain.payment;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckoutPaymentRepository extends JpaRepository<CheckoutPayment, UUID> {

    Optional<CheckoutPayment> findByPaymentIntentId(String paymentIntentId);
}

