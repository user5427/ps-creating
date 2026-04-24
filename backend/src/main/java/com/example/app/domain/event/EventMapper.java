package com.example.app.domain.event;

import com.example.app.api.event.EventResponse;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .category(event.getCategory())
                .venue(event.getVenue())
                .imageUrl(event.getImageUrl())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .capacity(event.getCapacity())
                .seatsSold(event.getSeatsSold())
                .remainingSeats(event.getRemainingSeats())
                .soldOut(event.isSoldOut())
                .price(event.getPrice())
                .status(event.getStatus().name())
                .organizerId(event.getOrganizerId())
                .version(event.getVersion())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
