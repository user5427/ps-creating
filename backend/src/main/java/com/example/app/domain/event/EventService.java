package com.example.app.domain.event;

import com.example.app.api.event.EventResponse;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {

    Page<EventResponse> listUpcoming(Pageable pageable);

    EventResponse get(UUID id);
}
