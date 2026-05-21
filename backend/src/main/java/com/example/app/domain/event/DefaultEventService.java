package com.example.app.domain.event;

import com.example.app.api.event.CreateEventRequest;
import com.example.app.api.event.EventDashboardResponse;
import com.example.app.api.event.EventResponse;
import com.example.app.api.event.UpdateEventRequest;
import com.example.app.aspect.Audited;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
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
    public Page<EventResponse> listUpcoming(String category,
                                            String location,
                                            LocalDate startDate,
                                            LocalDate endDate,
                                            Pageable pageable) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startDateTime = startDate == null
            ? null
            : startDate.atStartOfDay().atOffset(now.getOffset());
        OffsetDateTime endDateTime = endDate == null
            ? null
            : endDate.atTime(LocalTime.MAX).atOffset(now.getOffset());

        return eventRepository
            .findAll(
                upcomingSpecification(
                    EventStatus.PUBLISHED,
                    now,
                    normalize(category),
                    normalize(location),
                    startDateTime,
                    endDateTime),
                pageable)
                .map(eventMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<String> listUpcomingCategories() {
        return eventRepository.findUpcomingCategories(EventStatus.PUBLISHED, OffsetDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse get(UUID id) {
        return eventMapper.toResponse(requireEvent(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventDashboardResponse> listOrganizerEvents(UUID organizerId, Pageable pageable) {
        return eventRepository
                .findByOrganizerId(organizerId, pageable)
                .map(eventMapper::toDashboardResponse);
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
        requireOrganizer(event, actorId);
        requireCurrentVersion(event, request.version());

        OffsetDateTime previousStart = event.getStartTime();
        applyUpdate(event, request);
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

    private static void requireOrganizer(Event event, UUID actorId) {
        if (!event.getOrganizerId().equals(actorId)) {
            throw new EventAccessDeniedException(
                    "Only the organizer of this event can edit it");
        }
    }

    /**
     * Null-safe comparison of the client-supplied @Version against the currently
     * persisted version. On mismatch we raise the standard Spring/JPA exception
     * so the {@code GlobalExceptionHandler} can translate it into a 409 response
     * identically to a natural Hibernate-detected stale write.
     */
    private static void requireCurrentVersion(Event event, Long expectedVersion) {
        if (!Objects.equals(expectedVersion, event.getVersion())) {
            throw new ObjectOptimisticLockingFailureException(Event.class, event.getId());
        }
    }

    /**
     * Single point where {@link UpdateEventRequest} is copied into a managed
     * {@link Event}. Centralising the field-by-field assignment keeps the
     * update service method short and gives us one place to revisit when new
     * fields are added to the request DTO.
     */
    private static void applyUpdate(Event event, UpdateEventRequest request) {
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setCategory(request.category());
        event.setVenue(request.venue());
        event.setImageUrl(request.imageUrl());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setCapacity(request.capacity());
        event.setPrice(request.price());
    }

    private static String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static Specification<Event> upcomingSpecification(EventStatus status,
                                                              OffsetDateTime from,
                                                              String category,
                                                              String location,
                                                              OffsetDateTime startDateTime,
                                                              OffsetDateTime endDateTime) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            predicates = cb.and(predicates, cb.equal(root.get("status"), status));
            predicates = cb.and(predicates, cb.greaterThanOrEqualTo(root.get("startTime"), from));

            if (category != null) {
                predicates = cb.and(
                        predicates,
                        cb.equal(cb.lower(root.get("category")), category.toLowerCase())
                );
            }

            if (location != null) {
                predicates = cb.and(
                        predicates,
                        cb.like(cb.lower(root.get("venue")), "%" + location.toLowerCase() + "%")
                );
            }

            if (startDateTime != null) {
                predicates = cb.and(predicates, cb.greaterThanOrEqualTo(root.get("startTime"), startDateTime));
            }

            if (endDateTime != null) {
                predicates = cb.and(predicates, cb.lessThanOrEqualTo(root.get("startTime"), endDateTime));
            }

            return predicates;
        };
    }
}
