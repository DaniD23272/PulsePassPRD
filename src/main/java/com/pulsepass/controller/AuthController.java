package com.pulsepass.controller;

import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.dto.response.AuthenticatedUserResponse;
import com.pulsepass.entity.User;
import com.pulsepass.entity.UserRole;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.UserRoleRepository;
import com.pulsepass.service.AuthService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public AuthController(
            AuthService authService,
            UserRepository userRepository,
            UserRoleRepository userRoleRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserResponse> me(
            Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED));

        List<String> roles = userRoleRepository.findAllByUserId(userId)
                .stream()
                .map(UserRole::getRole)
                .toList();

        return ResponseEntity.ok(new AuthenticatedUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roles));
    }
}