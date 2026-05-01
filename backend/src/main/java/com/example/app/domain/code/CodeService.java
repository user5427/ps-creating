package com.example.app.domain.code;

import com.example.app.api.code.CodeResponse;
import com.example.app.api.code.GenerateCodeRequest;
import com.example.app.api.code.MyTicketEventSummaryResponse;
import com.example.app.api.code.MyTicketsByEventResponse;
import com.example.app.api.code.ScanCodeRequest;
import com.example.app.api.code.ScanCodeResponse;
import com.example.app.domain.user.Role;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CodeService {

    CodeResponse generate(GenerateCodeRequest request);

    ScanCodeResponse scan(ScanCodeRequest request);

    CodeResponse view(UUID codeId, UUID actorId, Role actorRole);

    Page<MyTicketEventSummaryResponse> listMyTickets(UUID attendeeId, Pageable pageable);

    MyTicketsByEventResponse listMyTicketsForEvent(UUID attendeeId, UUID eventId, Pageable pageable);
}
