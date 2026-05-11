package com.example.app.domain.payment;

public class CheckoutAccessDeniedException extends RuntimeException {

    public CheckoutAccessDeniedException(String message) {
        super(message);
    }
}

