package com.example.app.domain.event;

import com.example.app.api.event.EventResponse;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getCategory(),
                event.getVenue(),
                event.getImageUrl(),
                event.getStartTime(),
                event.getEndTime(),
                event.getCapacity(),
                event.getSeatsSold(),
                event.getRemainingSeats(),
                event.isSoldOut(),
                event.getPrice(),
                event.getStatus().name(),
                event.getOrganizerId(),
                event.getVersion(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
