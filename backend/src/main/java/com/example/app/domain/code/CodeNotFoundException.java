package com.example.app.domain.code;

import java.util.UUID;

public class CodeNotFoundException extends RuntimeException {

    private final UUID codeId;

    public CodeNotFoundException(UUID codeId) {
        super("Code not found: " + codeId);
        this.codeId = codeId;
    }

    public UUID getCodeId() {
        return codeId;
    }
}
