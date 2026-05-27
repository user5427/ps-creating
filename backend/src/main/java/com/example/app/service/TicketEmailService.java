package com.example.app.service;

public interface TicketEmailService {

    void sendTicketConfirmation(TicketConfirmationEmail confirmation);

    void sendEventReminder(EventReminderEmail reminder);
}
