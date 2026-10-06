package com.pulsepass.dto.response;

public record UserResponse(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        Integer age
) {
}