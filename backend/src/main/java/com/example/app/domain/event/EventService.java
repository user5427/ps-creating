package com.example.app.domain.event;

import com.example.app.api.event.CreateEventRequest;
import com.example.app.api.event.EventResponse;
import com.example.app.api.event.UpdateEventRequest;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {

    Page<EventResponse> listUpcoming(Pageable pageable);

    EventResponse get(UUID id);

    EventResponse create(CreateEventRequest request, UUID organizerId);

    EventResponse update(UUID id, UpdateEventRequest request, UUID actorId);
}
