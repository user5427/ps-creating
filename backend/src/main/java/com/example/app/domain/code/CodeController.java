package com.example.app.domain.code;

import com.example.app.api.code.CodeResponse;
import com.example.app.api.code.GenerateCodeRequest;
import com.example.app.api.code.ScanCodeRequest;
import com.example.app.api.code.ScanCodeResponse;
import com.example.app.web.ActorContext;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

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
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<CodeResponse> generate(@Valid @RequestBody GenerateCodeRequest request) {
        CodeResponse created = codeService.generate(request);
        return ResponseEntity
                .created(URI.create("/api/codes/" + created.id()))
                .body(created);
    }

    @PostMapping("/scan")
    @PreAuthorize("hasRole('SCANNER')")
    public ScanCodeResponse scan(@Valid @RequestBody ScanCodeRequest request) {
        return codeService.scan(request);
    }

    @GetMapping("/{id}")
    public CodeResponse view(@PathVariable UUID id) {
        return codeService.view(id, actorContext.getActorId(), actorContext.getRole());
    }

    
}
