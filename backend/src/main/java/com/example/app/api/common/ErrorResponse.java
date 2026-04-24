package com.example.app.api.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String code,
        String message,
        Map<String, String> fieldErrors,
        Object currentServerState
) {
    public static ErrorResponse simple(String code, String message) {
        return new ErrorResponse(code, message, null, null);
    }

    public static ErrorResponse validation(Map<String, String> fieldErrors) {
        return new ErrorResponse("VALIDATION_FAILED", "Request validation failed", fieldErrors, null);
    }

    public static ErrorResponse conflict(String message, Object currentServerState) {
        return new ErrorResponse("CONFLICT", message, null, currentServerState);
    }
}
