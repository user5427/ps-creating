package com.example.app.domain.code;

public class CodePaymentNotCompletedException extends RuntimeException {

    private final String paymentIntentId;
    private final String paymentStatus;

    public CodePaymentNotCompletedException(String paymentIntentId, String paymentStatus) {
        super("Payment intent is not completed: " + paymentIntentId + " status=" + paymentStatus);
        this.paymentIntentId = paymentIntentId;
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }
}