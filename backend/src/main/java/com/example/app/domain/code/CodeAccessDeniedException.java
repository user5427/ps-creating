package com.example.app.domain.code;

public class CodeAccessDeniedException extends RuntimeException {

    public CodeAccessDeniedException(String message) {
        super(message);
    }
}
