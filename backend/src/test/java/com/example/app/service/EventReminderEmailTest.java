package com.example.app.service;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class EventReminderEmailTest {

    @Test
    void testRecordCreation() {
        UUID ticketId = UUID.randomUUID();
        OffsetDateTime startTime = OffsetDateTime.now().plusHours(24);

        EventReminderEmail email = new EventReminderEmail(
                "user@example.com",
                "Jane",
                "Summer Festival",
                "Central Park",
                startTime,
                ticketId
        );

        assertNotNull(email);
        assertEquals("user@example.com", email.recipientEmail());
        assertEquals("Jane", email.recipientFirstName());
        assertEquals("Summer Festival", email.eventTitle());
        assertEquals("Central Park", email.eventVenue());
        assertEquals(startTime, email.eventStartTime());
        assertEquals(ticketId, email.ticketId());
    }
}
