package com.pulsepass.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

public record RegisterUserRequest(
        @NotBlank String username,
        @NotBlank @Email String email,
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phone,
        String city,
        @NotNull LocalDate birthDate,
        @NotBlank
        @Size(min = 12, message = "Password must contain at least 12 characters")
        String password
) {
    // BCrypt limita por bytes, no por caracteres: "á" ocupa 2 bytes en UTF-8.
    @AssertTrue(message = "Password must not exceed 72 bytes")
    public boolean isPasswordWithinBcryptLimit() {
        return password == null || password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}