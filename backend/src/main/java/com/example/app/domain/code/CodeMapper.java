package com.example.app.domain.code;

import com.example.app.api.code.CodeEventResponse;
import com.example.app.api.code.CodeResponse;
import com.example.app.api.code.CodeUserResponse;
import com.example.app.api.code.MyTicketEntryResponse;
import com.example.app.api.code.MyTicketEventSummaryResponse;
import org.springframework.stereotype.Component;

@Component
public class CodeMapper {

    public CodeResponse toResponse(Code code, String qrData) {
        CodeUserResponse user = new CodeUserResponse(
                code.getUser().getId(),
                code.getUser().getFirstName(),
                code.getUser().getLastName(),
                code.getUser().getEmail());

        return new CodeResponse(
                code.getId(),
                code.getScanCount(),
                qrData,
                user,
                toEventResponse(code),
                code.getCreatedAt(),
                code.getUpdatedAt());
    }

    public MyTicketEventSummaryResponse toMyTicketEventSummary(CodeRepository.MyTicketEventGroupProjection projection) {
        return new MyTicketEventSummaryResponse(
                projection.getEventId(),
                projection.getEventTitle(),
                projection.getEventStartTime(),
                projection.getEventEndTime(),
                (int) projection.getTicketQuantity());
    }

    public MyTicketEntryResponse toMyTicketEntry(Code code, String qrData) {
        return new MyTicketEntryResponse(
            qrData);
    }

    public CodeEventResponse toEventResponse(Code code) {
        return new CodeEventResponse(
                code.getEvent().getId(),
                code.getEvent().getTitle(),
                code.getEvent().getVenue(),
                code.getEvent().getStartTime(),
                code.getEvent().getEndTime());
    }
}
