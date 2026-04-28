package com.example.app.domain.code;

import com.example.app.api.code.CodeResponse;
import com.example.app.api.code.ConfirmPurchaseRequest;
import com.example.app.api.code.GenerateCodeRequest;
import com.example.app.api.code.ScanCodeRequest;
import com.example.app.api.code.ScanCodeResponse;
import com.example.app.web.ActorContext;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/codes")
public class CodeController {

    private final CodeService codeService;
    private final ActorContext actorContext;

    public CodeController(CodeService codeService, ActorContext actorContext) {
        this.codeService = codeService;
        this.actorContext = actorContext;
    }

    @PostMapping("/generate")
    public ResponseEntity<CodeResponse> generate(@Valid @RequestBody GenerateCodeRequest request) {
        requireOrganizer();
        CodeResponse created = codeService.generate(request);
        return ResponseEntity
                .created(URI.create("/api/codes/" + created.id()))
                .body(created);
    }

    @PostMapping("/confirm-purchase")
    public ResponseEntity<CodeResponse> confirmPurchase(@Valid @RequestBody ConfirmPurchaseRequest request) {
        CodeResponse created = codeService.confirmPurchase(request, actorContext.getActorId());
        return ResponseEntity
                .created(URI.create("/api/codes/" + created.id()))
                .body(created);
    }

    @PostMapping("/scan")
    public ScanCodeResponse scan(@Valid @RequestBody ScanCodeRequest request) {
        requireOrganizer();
        return codeService.scan(request);
    }

    @GetMapping("/{id}")
    public CodeResponse view(@PathVariable UUID id) {
        return codeService.view(id, actorContext.getActorId(), actorContext.getRole());
    }

    private void requireOrganizer() {
        if (!actorContext.isOrganizer()) {
            throw new CodeAccessDeniedException("Only organizers can generate or scan QR codes");
        }
    }
}
