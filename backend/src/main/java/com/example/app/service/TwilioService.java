package com.example.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class TwilioService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String twilioPhoneNumber;

    /**
     * Send an SMS message
     * @param phoneNumber recipient phone number
     * @param message message content
     */
    public void sendSMS(String phoneNumber, String message) {
        try {
            Message.creator(
                    new PhoneNumber(phoneNumber),      // To number
                    new PhoneNumber(twilioPhoneNumber), // From number
                    message)                            // SMS body
                    .create();
        } catch (Exception e) {
            throw new RuntimeException("Failed to send SMS", e);
        }
    }
}
