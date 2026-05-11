package com.example.app.domain.event;

import com.example.app.api.event.CreateEventRequest;
import com.example.app.api.event.EventDashboardResponse;
import com.example.app.api.event.EventResponse;
import com.example.app.api.event.UpdateEventRequest;
import java.time.Duration;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Quality requirement #8 — Decorator pattern.
 * Wraps {@link DefaultEventService} with a simple in-memory cache on
 * {@code listUpcoming} (30s TTL). Invalidated on create/update so the list
 * never goes stale from an organizer's own actions.
 *
 * Swapped in via {@link Primary}; constructor takes the inner bean by
 * qualifier. Disable by removing {@link Primary} or changing the qualifier.
 */
@Service
@Primary
public class EventServiceDecorator implements EventService {

    private static final Logger log = LoggerFactory.getLogger(EventServiceDecorator.class);
    private static final Duration TTL = Duration.ofSeconds(30);

    private final EventService delegate;
    private final ConcurrentMap<CacheKey, CacheEntry> listCache = new ConcurrentHashMap<>();

    public EventServiceDecorator(@Qualifier("defaultEventService") EventService delegate) {
        this.delegate = delegate;
    }

    @Override
    public Page<EventResponse> listUpcoming(String category,
                                            String location,
                                            LocalDate startDate,
                                            LocalDate endDate,
                                            Pageable pageable) {
        CacheKey key = new CacheKey(pageable, category, location, startDate, endDate);
        CacheEntry cached = listCache.get(key);
        Instant now = Instant.now();
        if (cached != null && cached.expiresAt.isAfter(now)) {
            log.debug("EventServiceDecorator cache HIT for {}", key);
            return cached.page;
        }
        log.debug("EventServiceDecorator cache MISS for {}", key);
        Page<EventResponse> fresh = delegate.listUpcoming(category, location, startDate, endDate, pageable);
        listCache.put(key, new CacheEntry(fresh, now.plus(TTL)));
        return fresh;
    }

    @Override
    public java.util.List<String> listUpcomingCategories() {
        return delegate.listUpcomingCategories();
    }

    @Override
    public EventResponse get(UUID id) {
        return delegate.get(id);
    }

    @Override
    public Page<EventDashboardResponse> listOrganizerEvents(UUID organizerId, Pageable pageable) {
        return delegate.listOrganizerEvents(organizerId, pageable);
    }

    @Override
    public EventResponse create(CreateEventRequest request, UUID organizerId) {
        EventResponse created = delegate.create(request, organizerId);
        invalidateListCache();
        return created;
    }

    @Override
    public EventResponse update(UUID id, UpdateEventRequest request, UUID actorId) {
        EventResponse updated = delegate.update(id, request, actorId);
        invalidateListCache();
        return updated;
    }

    public void invalidateListCache() {
        log.debug("EventServiceDecorator list cache invalidated");
        listCache.clear();
    }

    private record CacheKey(Pageable pageable,
                            String category,
                            String location,
                            LocalDate startDate,
                            LocalDate endDate) {}

    private record CacheEntry(Page<EventResponse> page, Instant expiresAt) {}
}
