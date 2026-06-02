package com.example.app.web;

import com.example.app.service.ScheduledEventReminderService;
import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("dev")
@RequestMapping("/api/dev/reminders")
public class DevReminderController {

    private final ScheduledEventReminderService scheduledEventReminderService;

    public DevReminderController(ScheduledEventReminderService scheduledEventReminderService) {
        this.scheduledEventReminderService = scheduledEventReminderService;
    }

    @PostMapping("/send-now")
    public Map<String, Object> sendNow(
            @RequestParam(defaultValue = "0") int hoursFromNow,
            @RequestParam(defaultValue = "48") int hoursToNow) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime windowStart = now.plusHours(hoursFromNow);
        OffsetDateTime windowEnd = now.plusHours(hoursToNow);

        int sent = scheduledEventReminderService.sendRemindersForWindow(windowStart, windowEnd);
        return Map.of(
                "sent", sent,
                "windowStart", windowStart.toString(),
                "windowEnd", windowEnd.toString());
    }
}
