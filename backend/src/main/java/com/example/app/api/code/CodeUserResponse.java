package com.example.app.api.code;

import java.util.UUID;

public record CodeUserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email
) {}
