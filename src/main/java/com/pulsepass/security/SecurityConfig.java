package com.pulsepass.security;

import com.pulsepass.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final tools.jackson.databind.ObjectMapper objectMapper;

    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter,
            tools.jackson.databind.ObjectMapper objectMapper) {
        this.jwtFilter = jwtFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) ->
                                writeError(response, HttpStatus.UNAUTHORIZED, "Unauthorized"))
                        .accessDeniedHandler((request, response, exception) ->
                                writeError(response, HttpStatus.FORBIDDEN, "Forbidden")))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users",
                                "/api/auth/login")
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/venues/active",
                                "/api/venues/*")
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/artists/active",
                                "/api/artists/by-stage-name",
                                "/api/artists/*")
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/events/published",
                                "/api/events/by-artist")
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/events/*/tickets/paid")
                        .hasAnyRole("STAFF", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/events")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PATCH, "/api/events/*/publish")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/events/*/artists/*")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/events/*")
                        .authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/tickets")
                        .hasRole("USER")

                        .requestMatchers(HttpMethod.GET, "/api/tickets/by-user")
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/tickets/*")
                        .hasAnyRole("USER", "STAFF", "ADMIN")

                        .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/cancel")
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/use")
                        .hasAnyRole("STAFF", "ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users/by-email",
                                "/api/users/by-username")
                        .hasAnyRole("USER", "STAFF", "ADMIN")

                        .anyRequest().authenticated())
                .addFilterBefore(
                        jwtFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${pulsepass.cors.allowed-origins:http://localhost:5173}")
            String allowedOrigins) {

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList());
        configuration.setAllowedMethods(
                List.of("GET", "POST", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    private void writeError(
            HttpServletResponse response,
            HttpStatus status,
            String message) throws IOException {

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ErrorResponse body = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                Map.of());

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}