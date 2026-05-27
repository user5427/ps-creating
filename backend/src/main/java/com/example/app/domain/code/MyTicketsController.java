package com.example.app.domain.code;

import com.example.app.api.code.MyTicketEventSummaryResponse;
import com.example.app.api.code.MyTicketsByEventResponse;
import com.example.app.web.ActorContext;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/tickets/me")
public class MyTicketsController {

    private final CodeService codeService;
    private final ActorContext actorContext;

    public MyTicketsController(CodeService codeService, ActorContext actorContext) {
        this.codeService = codeService;
        this.actorContext = actorContext;
    }

    @GetMapping
    @PreAuthorize("hasRole('ATTENDEE')")
    public Page<MyTicketEventSummaryResponse> listMyTickets(@PageableDefault(size = 12) Pageable pageable) {
        return codeService.listMyTickets(actorContext.getActorId(), pageable);
    }

    @GetMapping("/events/{eventId}")
    @PreAuthorize("hasRole('ATTENDEE')")
    public MyTicketsByEventResponse listMyTicketsForEvent(@PathVariable UUID eventId,
                                                          @PageableDefault(size = 6) Pageable pageable) {
        return codeService.listMyTicketsForEvent(actorContext.getActorId(), eventId, pageable);
    }

}
