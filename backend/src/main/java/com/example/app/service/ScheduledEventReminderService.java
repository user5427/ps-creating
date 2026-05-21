package com.example.app.service;

import com.example.app.domain.code.Code;
import com.example.app.domain.code.CodeRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ScheduledEventReminderService {

    private final CodeRepository codeRepository;
    private final TicketEmailService ticketEmailService;

    public ScheduledEventReminderService(CodeRepository codeRepository, TicketEmailService ticketEmailService) {
        this.codeRepository = codeRepository;
        this.ticketEmailService = ticketEmailService;
    }

    // Run hourly and send reminders for events starting ~24 hours from now
    @Scheduled(cron = "0 0 * * * *")
    @Transactional(readOnly = true)
    public void sendReminders() {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime windowStart = now.plusHours(24);
        OffsetDateTime windowEnd = now.plusHours(25);

        sendRemindersForWindow(windowStart, windowEnd);
    }

    @Transactional(readOnly = true)
    public int sendRemindersForWindow(OffsetDateTime windowStart, OffsetDateTime windowEnd) {
        int sentCount = 0;

        List<Code> codes = codeRepository.findCodesForEventStartBetween(windowStart, windowEnd);
        for (Code code : codes) {
            if (code.getEvent() == null || code.getUser() == null) continue;
            try {
                ticketEmailService.sendEventReminder(new EventReminderEmail(
                        code.getUser().getEmail(),
                        code.getUser().getFirstName(),
                        code.getEvent().getTitle(),
                        code.getEvent().getVenue(),
                        code.getEvent().getStartTime(),
                        code.getId()));
                sentCount++;
            } catch (Exception ex) {
                // swallow send errors to avoid stopping the loop; logging would be here
            }
        }

        return sentCount;
    }
}
