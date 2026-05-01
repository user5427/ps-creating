package com.example.app.domain.code;

import com.example.app.api.code.CodeEventResponse;
import com.example.app.api.code.CodeResponse;
import com.example.app.api.code.GenerateCodeRequest;
import com.example.app.api.code.MyTicketEntryResponse;
import com.example.app.api.code.MyTicketEventSummaryResponse;
import com.example.app.api.code.MyTicketsByEventResponse;
import com.example.app.api.code.ScanCodeRequest;
import com.example.app.api.code.ScanCodeResponse;
import com.example.app.domain.event.Event;
import com.example.app.domain.event.EventNotFoundException;
import com.example.app.domain.event.EventRepository;
import com.example.app.domain.user.Role;
import com.example.app.domain.user.User;
import com.example.app.domain.user.UserRepository;
import com.example.app.util.CodeQrUtils;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DefaultCodeService implements CodeService {

    private final CodeRepository codeRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final CodeMapper codeMapper;
    private final CodeQrUtils codeQrUtils;

    public DefaultCodeService(CodeRepository codeRepository,
                              UserRepository userRepository,
                              EventRepository eventRepository,
                              CodeMapper codeMapper,
                              CodeQrUtils codeQrUtils) {
        this.codeRepository = codeRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.codeMapper = codeMapper;
        this.codeQrUtils = codeQrUtils;
    }

    @Override
    public CodeResponse generate(GenerateCodeRequest request) {
        UUID codeId = request.id() != null ? request.id() : UUID.randomUUID();
        if (codeRepository.existsById(codeId)) {
            throw new CodeAlreadyExistsException(codeId);
        }

        User user = requireUser(request.userId());
        Event event = requireEvent(request.eventId());

        Code code = new Code(codeId, user, event);
        Code saved = codeRepository.save(code);

        return codeMapper.toResponse(saved, codeQrUtils.createPayload(saved.getId()));
    }

    @Override
    public ScanCodeResponse scan(ScanCodeRequest request) {
        return codeQrUtils.extractCodeId(request.qrData())
                .flatMap(codeRepository::findDetailedById)
                .map(code -> {
                    code.incrementScanCount();
                    Code saved = codeRepository.save(code);
                    CodeResponse response = codeMapper.toResponse(
                            saved,
                            codeQrUtils.createPayload(saved.getId()));
                    return ScanCodeResponse.valid(response);
                })
                .orElse(ScanCodeResponse.invalid("QR code is invalid"));
    }

    @Override
    @Transactional(readOnly = true)
    public CodeResponse view(UUID codeId, UUID actorId, Role actorRole) {
        Code code = codeRepository.findDetailedById(codeId)
                .orElseThrow(() -> new CodeNotFoundException(codeId));

        boolean belongsToActor = code.getUser().getId().equals(actorId);
        if (actorRole != Role.ORGANIZER && !belongsToActor) {
            throw new CodeAccessDeniedException("You can only view QR codes assigned to your account");
        }

        return codeMapper.toResponse(code, codeQrUtils.createPayload(code.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MyTicketEventSummaryResponse> listMyTickets(UUID attendeeId, Pageable pageable) {
        return codeRepository.findTicketGroupsByAttendeeId(attendeeId, pageable)
                .map(codeMapper::toMyTicketEventSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public MyTicketsByEventResponse listMyTicketsForEvent(UUID attendeeId, UUID eventId, Pageable pageable) {
        Page<Code> tickets = codeRepository.findByUserIdAndEventIdOrderByCreatedAtAsc(attendeeId, eventId, pageable);

        Event event = requireEvent(eventId);
        CodeEventResponse eventResponse = new CodeEventResponse(
                event.getId(),
                event.getTitle(),
                event.getVenue(),
                event.getStartTime(),
                event.getEndTime());

        Page<MyTicketEntryResponse> entries = tickets.map(code ->
                codeMapper.toMyTicketEntry(code, codeQrUtils.createPayload(code.getId())));

        return new MyTicketsByEventResponse(eventResponse, entries);
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CodeAccessDeniedException("User does not exist: " + userId));
    }

    private Event requireEvent(UUID eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));
    }
}
