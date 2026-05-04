package com.example.app.api.code;

import org.springframework.data.domain.Page;

public record MyTicketsByEventResponse(
        CodeEventResponse event,
        Page<MyTicketEntryResponse> tickets
) {}
