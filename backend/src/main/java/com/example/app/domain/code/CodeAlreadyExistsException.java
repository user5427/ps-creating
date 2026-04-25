package com.example.app.domain.code;

import java.util.UUID;

public class CodeAlreadyExistsException extends RuntimeException {

    private final UUID codeId;

    public CodeAlreadyExistsException(UUID codeId) {
        super("Code already exists: " + codeId);
        this.codeId = codeId;
    }

    public UUID getCodeId() {
        return codeId;
    }
}
