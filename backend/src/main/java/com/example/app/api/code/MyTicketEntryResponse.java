package com.example.app.api.code;

public record MyTicketEntryResponse(
        String qrData,
        int scanCount
) {}
