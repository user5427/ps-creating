package com.example.app.api.code;

import jakarta.validation.constraints.NotBlank;

public record ScanCodeRequest(@NotBlank String qrData) {}
