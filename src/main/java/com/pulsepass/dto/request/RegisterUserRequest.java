package com.pulsepass.dto.request;

public record RegisterUserRequest(
        String username,
        String email,
        String password,
        String firstName,
        String lastName,
        Integer age
) {
}