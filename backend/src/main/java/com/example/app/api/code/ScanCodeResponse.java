package com.example.app.api.code;

public record ScanCodeResponse(
        boolean valid,
        String message,
        CodeResponse code
) {
    public static ScanCodeResponse valid(CodeResponse code) {
        return new ScanCodeResponse(true, "QR code is valid", code);
    }

    public static ScanCodeResponse invalid(String message) {
        return new ScanCodeResponse(false, message, null);
    }
}
