package com.example.app.domain.event;

import com.example.app.api.event.CreateEventRequest;
import com.example.app.api.event.EventResponse;
import com.example.app.api.event.UpdateEventRequest;
import com.example.app.aspect.Audited;
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
        return eventMapper.toResponse(requireEvent(id));
    }

    @Override
    @Audited("event.create")
    public EventResponse create(CreateEventRequest request, UUID organizerId) {
        Event event = new Event(
                request.title(),
                request.description(),
                request.category(),
                request.venue(),
                request.imageUrl(),
                request.startTime(),
                request.endTime(),
                request.capacity(),
                request.price(),
                organizerId
        );
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    @Audited("event.update")
    public EventResponse update(UUID id, UpdateEventRequest request, UUID actorId) {
        Event event = requireEvent(id);

        if (!event.getOrganizerId().equals(actorId)) {
            throw new EventAccessDeniedException(
                    "Only the organizer of this event can edit it");
        }

        // Force the expected @Version onto the managed entity so Hibernate
        // raises ObjectOptimisticLockingFailureException on a stale write.
        if (!request.version().equals(event.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(Event.class, id);
        }

        OffsetDateTime previousStart = event.getStartTime();

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setCategory(request.category());
        event.setVenue(request.venue());
        event.setImageUrl(request.imageUrl());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setCapacity(request.capacity());
        event.setPrice(request.price());

        Event saved = eventRepository.save(event);

        if (!previousStart.isEqual(request.startTime()) && saved.getSeatsSold() > 0) {
            // TODO: notify ticket holders on date change — see US-12 AC2.
            //       Deferred until ticket purchase flow (US-04..US-06) exists and
            //       the notification delivery story (US-06/US-08/US-17) defines the contract.
        }

        return eventMapper.toResponse(saved);
    }

    private Event requireEvent(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
    }
}
