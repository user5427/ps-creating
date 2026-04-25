package com.example.app.domain.code;

import com.example.app.api.code.CodeEventResponse;
import com.example.app.api.code.CodeResponse;
import com.example.app.api.code.CodeUserResponse;
import org.springframework.stereotype.Component;

@Component
public class CodeMapper {

    public CodeResponse toResponse(Code code, String qrData) {
        CodeUserResponse user = new CodeUserResponse(
                code.getUser().getId(),
                code.getUser().getFirstName(),
                code.getUser().getLastName(),
                code.getUser().getEmail());

        CodeEventResponse event = new CodeEventResponse(
                code.getEvent().getId(),
                code.getEvent().getTitle(),
                code.getEvent().getVenue(),
                code.getEvent().getStartTime(),
                code.getEvent().getEndTime());

        return new CodeResponse(
                code.getId(),
                code.getScanCount(),
                qrData,
                user,
                event,
                code.getCreatedAt(),
                code.getUpdatedAt());
    }
}
