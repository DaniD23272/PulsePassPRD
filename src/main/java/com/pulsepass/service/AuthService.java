package com.pulsepass.service;

import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.pulsepass.dto.request.LoginRequest;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.identifier(),
                                request.password()));

        String userId = authentication.getName();
        String token = jwtService.generateToken(userId);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getAccessTokenTtl().toSeconds());
    }
}