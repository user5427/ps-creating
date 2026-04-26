package com.example.app.service;

import com.example.app.domain.event.Event;
import com.example.app.domain.user.User;
import java.util.UUID;

public interface TicketEmailService {

    void sendTicketConfirmation(User user, Event event, UUID ticketId, String qrPayload);
}
