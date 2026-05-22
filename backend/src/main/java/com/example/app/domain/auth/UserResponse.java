package com.example.app.domain.auth;

import java.util.UUID;

public class UserResponse {

    private final UUID id;
    private final String email;
    private final String role;

    public UserResponse(UUID id, String email, String role) {
        this.id = id;
        this.email = email;
        this.role = role;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}

