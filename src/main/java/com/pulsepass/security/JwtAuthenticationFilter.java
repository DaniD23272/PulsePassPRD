package com.pulsepass.security;

import tools.jackson.databind.json.JsonMapper;
import com.pulsepass.dto.response.ErrorResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService JwtService;
    private final CustomUserDetailsService userDetailsService;
    private final JsonMapper objectMapper;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            JsonMapper objectMapper) {
        this.JwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {

        Enumeration<String> values = request.getHeaders("Authorization");
        List<String> headers = Collections.list(values);

        if (headers.size() > 1) {
            writeUnauthorized(response);
            return;
        }

        if (headers.isEmpty()) {
            chain.doFilter(request, response);
            return;
        }

        String header = headers.get(0);
        if (header == null || !header.startsWith("Bearer ")) {
            writeUnauthorized(response);
            return;
        }

        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            writeUnauthorized(response);
            return;
        }

        try {
            Claims claims= JwtService.parseAndValidate(token);
            Long userId = Long.valueOf(claims.getSubject());
            UserDetails userDetails = userDetailsService.loadUserById(userId);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request));

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

        } catch (JwtException
                 | IllegalArgumentException
                 | UsernameNotFoundException ex) {
            SecurityContextHolder.clearContext();
            writeUnauthorized(response);
            return;
        }

        chain.doFilter(request, response);
    }

    private void writeUnauthorized(
            HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ErrorResponse body = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "Unauthorized",
                Map.of());

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}