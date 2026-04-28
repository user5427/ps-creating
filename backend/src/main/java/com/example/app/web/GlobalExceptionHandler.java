package com.example.app.web;

import com.example.app.api.common.ErrorResponse;
import com.example.app.api.event.EventResponse;
import com.example.app.domain.code.CodeAccessDeniedException;
import com.example.app.domain.code.CodeAlreadyExistsException;
import com.example.app.domain.code.CodeNotFoundException;
import com.example.app.domain.code.CodePaymentNotCompletedException;
import com.example.app.domain.event.Event;
import com.example.app.domain.event.EventAccessDeniedException;
import com.example.app.domain.event.EventMapper;
import com.example.app.domain.event.EventNotFoundException;
import com.example.app.domain.event.EventRepository;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    public GlobalExceptionHandler(EventRepository eventRepository, EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.eventMapper = eventMapper;
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EventNotFoundException ex) {
        String message = "Event %s does not exist".formatted(ex.getEventId());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.simple("NOT_FOUND", message));
    }

    @ExceptionHandler(EventAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(EventAccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.simple("FORBIDDEN", ex.getMessage()));
    }

    @ExceptionHandler(CodeNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCodeNotFound(CodeNotFoundException ex) {
        String message = "Code %s does not exist".formatted(ex.getCodeId());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.simple("NOT_FOUND", message));
    }

    @ExceptionHandler(CodeAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleCodeAccessDenied(CodeAccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.simple("FORBIDDEN", ex.getMessage()));
    }

    @ExceptionHandler(CodeAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleCodeExists(CodeAlreadyExistsException ex) {
        String message = "Code %s already exists".formatted(ex.getCodeId());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.simple("CONFLICT", message));
    }

        @ExceptionHandler(CodePaymentNotCompletedException.class)
        public ResponseEntity<ErrorResponse> handlePaymentNotCompleted(CodePaymentNotCompletedException ex) {
        String message = "Payment %s is not completed (status=%s)"
            .formatted(ex.getPaymentIntentId(), ex.getPaymentStatus());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.simple("PAYMENT_NOT_COMPLETED", message));
        }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                fieldErrors.put(fe.getField(),
                        fe.getDefaultMessage() == null ? "invalid" : fe.getDefaultMessage()));
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.validation(fieldErrors));
    }

    /**
     * Quality requirement #4: on a version clash during PUT, return 409 and
     * the current server state so the frontend can show a conflict UI.
     */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        EventResponse current = null;
        Object idValue = ex.getIdentifier();
        if (Event.class.equals(ex.getPersistentClass()) && idValue instanceof UUID id) {
            current = eventRepository.findById(id)
                    .map(eventMapper::toResponse)
                    .orElse(null);
        }
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.conflict(
                        "Event was modified by someone else. Refresh to see the current version.",
                        current));
    }
}
