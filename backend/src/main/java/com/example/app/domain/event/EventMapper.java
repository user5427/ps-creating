package com.example.app.domain.event;

import com.example.app.api.event.EventDashboardResponse;
import com.example.app.api.event.EventResponse;
import com.example.app.domain.pricing.PricingStrategy;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    private final PricingStrategy pricingStrategy;

    public EventMapper(PricingStrategy pricingStrategy) {
        this.pricingStrategy = pricingStrategy;
    }

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
                .price(pricingStrategy.displayPrice(event))
                .status(event.getStatus().name())
                .organizerId(event.getOrganizerId())
                .version(event.getVersion())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }

    public EventDashboardResponse toDashboardResponse(Event event) {
        BigDecimal totalRevenue = event.getPrice()
                .multiply(BigDecimal.valueOf(event.getSeatsSold()));

        return EventDashboardResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .category(event.getCategory())
                .venue(event.getVenue())
                .imageUrl(event.getImageUrl())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .capacity(event.getCapacity())
                .ticketsSold(event.getSeatsSold())
                .remainingCapacity(event.getRemainingSeats())
                .price(pricingStrategy.displayPrice(event))
                .totalRevenue(totalRevenue)
                .status(event.getStatus().name())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
