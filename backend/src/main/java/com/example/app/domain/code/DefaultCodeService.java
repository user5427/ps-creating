package com.example.app.domain.code;

import com.example.app.api.code.CodeResponse;
import com.example.app.api.code.ConfirmPurchaseRequest;
import com.example.app.api.code.GenerateCodeRequest;
import com.example.app.api.code.ScanCodeRequest;
import com.example.app.api.code.ScanCodeResponse;
import com.example.app.domain.event.Event;
import com.example.app.domain.event.EventNotFoundException;
import com.example.app.domain.event.EventRepository;
import com.example.app.domain.user.Role;
import com.example.app.domain.user.User;
import com.example.app.domain.user.UserRepository;
import com.example.app.service.StripeService;
import com.example.app.service.TicketEmailService;
import com.example.app.util.CodeQrUtils;
import com.stripe.model.PaymentIntent;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
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
    private final StripeService stripeService;
    private final TicketEmailService ticketEmailService;
    private final boolean fakePaymentsEnabled;

    public DefaultCodeService(CodeRepository codeRepository,
                              UserRepository userRepository,
                              EventRepository eventRepository,
                              CodeMapper codeMapper,
                              CodeQrUtils codeQrUtils,
                              StripeService stripeService,
                              TicketEmailService ticketEmailService,
                              @Value("${app.dev.fake-payments-enabled:true}") boolean fakePaymentsEnabled) {
        this.codeRepository = codeRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.codeMapper = codeMapper;
        this.codeQrUtils = codeQrUtils;
        this.stripeService = stripeService;
        this.ticketEmailService = ticketEmailService;
        this.fakePaymentsEnabled = fakePaymentsEnabled;
    }

    @Override
    public CodeResponse generate(GenerateCodeRequest request) {
        UUID codeId = request.id() != null ? request.id() : UUID.randomUUID();
        if (codeRepository.existsById(Objects.requireNonNull(codeId))) {
            throw new CodeAlreadyExistsException(codeId);
        }

        User user = requireUser(request.userId());
        Event event = requireEvent(request.eventId());

        Code code = new Code(codeId, user, event);
        Code saved = codeRepository.save(code);

        return codeMapper.toResponse(saved, codeQrUtils.createPayload(saved.getId()));
    }

    @Override
    public CodeResponse confirmPurchase(ConfirmPurchaseRequest request, UUID actorId) {
        if (!isFakeSucceededPayment(request.paymentIntentId())) {
            PaymentIntent paymentIntent = stripeService.retrievePaymentIntent(request.paymentIntentId());
            if (!Objects.equals("succeeded", paymentIntent.getStatus())) {
                throw new CodePaymentNotCompletedException(request.paymentIntentId(), paymentIntent.getStatus());
            }
        }

        User user = requireUser(actorId);
        Event event = requireEvent(request.eventId());

        Code code = new Code(UUID.randomUUID(), user, event);
        Code saved = codeRepository.save(code);

        String qrPayload = codeQrUtils.createPayload(saved.getId());
        ticketEmailService.sendTicketConfirmation(user, event, saved.getId(), qrPayload);

        return codeMapper.toResponse(saved, qrPayload);
    }

    private boolean isFakeSucceededPayment(String paymentIntentId) {
        return fakePaymentsEnabled
                && paymentIntentId != null
                && paymentIntentId.startsWith("fake_succeeded_");
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

    private User requireUser(UUID userId) {
        return userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new CodeAccessDeniedException("User does not exist: " + userId));
    }

    private Event requireEvent(UUID eventId) {
        return eventRepository.findById(Objects.requireNonNull(eventId))
                .orElseThrow(() -> new EventNotFoundException(eventId));
    }
}
