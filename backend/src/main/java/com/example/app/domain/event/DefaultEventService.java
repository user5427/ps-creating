package com.example.app.domain.event;

import com.example.app.api.event.EventResponse;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("defaultEventService")
@Transactional
public class DefaultEventService implements EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    public DefaultEventService(EventRepository eventRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventResponse> listUpcoming(Pageable pageable) {
        return eventRepository
                .findUpcoming(EventStatus.PUBLISHED, OffsetDateTime.now(), pageable)
                .map(eventMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse get(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        return eventMapper.toResponse(event);
    }
}
