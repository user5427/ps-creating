package com.example.app.domain.auth;

import java.util.List;

public class AuthResponse {

    private final String token;
    private final String email;
    private final List<String> roles;

    public AuthResponse(String token, String email, List<String> roles) {
        this.token = token;
        this.email = email;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() {
        return roles;
    }
}

