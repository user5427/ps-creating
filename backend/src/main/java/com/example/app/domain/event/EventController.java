package com.example.app.domain.event;

import com.example.app.api.event.CreateEventRequest;
import com.example.app.api.event.EventDashboardResponse;
import com.example.app.api.event.EventResponse;
import com.example.app.api.event.UpdateEventRequest;
import com.example.app.web.ActorContext;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final ActorContext actorContext;

    public EventController(EventService eventService, ActorContext actorContext) {
        this.eventService = eventService;
        this.actorContext = actorContext;
    }

    @GetMapping
    public Page<EventResponse> list(@PageableDefault(size = 12) Pageable pageable) {
        return eventService.listUpcoming(pageable);
    }

    @GetMapping("/me")
    public Page<EventDashboardResponse> listMyEvents(@PageableDefault(size = 12) Pageable pageable) {
        requireOrganizer();
        return eventService.listOrganizerEvents(actorContext.getActorId(), pageable);
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable UUID id) {
        return eventService.get(id);
    }

    @PostMapping
    public ResponseEntity<EventResponse> create(@Valid @RequestBody CreateEventRequest request) {
        requireOrganizer();
        EventResponse created = eventService.create(request, actorContext.getActorId());
        return ResponseEntity
                .created(URI.create("/api/events/" + created.id()))
                .body(created);
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable UUID id,
                                @Valid @RequestBody UpdateEventRequest request) {
        requireOrganizer();
        return eventService.update(id, request, actorContext.getActorId());
    }

    private void requireOrganizer() {
        if (!actorContext.isOrganizer()) {
            throw new EventAccessDeniedException("Only organizers can manage events");
        }
    }
}
