package com.pulsepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    JwtService jwtService;

    @Mock
    CustomUserDetailsService userDetailsService;

    JsonMapper objectMapper = JsonMapper.builder().build();

    JwtAuthenticationFilter filter;

    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();
    FilterChain chain = mock(FilterChain.class);

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtService, userDetailsService, objectMapper);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private UserDetails userDetails(String id, String... roles) {
        List<SimpleGrantedAuthority> authorities = List.of(roles).stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role)).toList();
        return User.withUsername(id).password("hash").authorities(authorities).build();
    }

    @Test
    void missingAuthorizationHeader_letsTheRequestThrough() throws Exception {
        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void duplicatedAuthorizationHeader_isRejectedWith401() throws Exception {
        request.addHeader("Authorization", "Bearer token-1");
        request.addHeader("Authorization", "Bearer token-2");

        filter.doFilterInternal(request, response, chain);

        verifyNoInteractions(chain);
        assertThat(response.getStatus()).isEqualTo(401);
    }

    @Test
    void headerWithoutBearerScheme_isRejectedWith401() throws Exception {
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        filter.doFilterInternal(request, response, chain);

        verifyNoInteractions(chain);
        assertThat(response.getStatus()).isEqualTo(401);
    }

    @Test
    void emptyBearerToken_isRejectedWith401() throws Exception {
        request.addHeader("Authorization", "Bearer ");

        filter.doFilterInternal(request, response, chain);

        verifyNoInteractions(chain);
        assertThat(response.getStatus()).isEqualTo(401);
    }

    @Test
    void validToken_setsAuthenticationAndLetsTheRequestThrough() throws Exception {
        request.addHeader("Authorization", "Bearer valid-token");
        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn("7");
        when(jwtService.parseAndValidate("valid-token")).thenReturn(claims);
        when(userDetailsService.loadUserById(7L)).thenReturn(userDetails("7", "USER"));

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("7");
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting(Object::toString).containsExactly("ROLE_USER");
    }

    @Test
    void invalidToken_isRejectedWith401AndClearsContext() throws Exception {
        request.addHeader("Authorization", "Bearer garbage");
        when(jwtService.parseAndValidate("garbage")).thenThrow(new JwtException("bad token"));

        filter.doFilterInternal(request, response, chain);

        verifyNoInteractions(chain);
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void tokenWithNonNumericSubject_isRejectedWith401() throws Exception {
        request.addHeader("Authorization", "Bearer weird-subject");
        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn("not-a-number");
        when(jwtService.parseAndValidate("weird-subject")).thenReturn(claims);

        filter.doFilterInternal(request, response, chain);

        verifyNoInteractions(chain);
        assertThat(response.getStatus()).isEqualTo(401);
    }

    @Test
    void tokenOfUnknownOrInactiveUser_isRejectedWith401() throws Exception {
        request.addHeader("Authorization", "Bearer valid-token");
        Claims claims = mock(Claims.class);
        when(claims.getSubject()).thenReturn("404");
        when(jwtService.parseAndValidate("valid-token")).thenReturn(claims);
        when(userDetailsService.loadUserById(404L))
                .thenThrow(new UsernameNotFoundException("Invalid credentials"));

        filter.doFilterInternal(request, response, chain);

        verifyNoInteractions(chain);
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void unauthorizedResponse_hasJsonErrorBody() throws Exception {
        request.addHeader("Authorization", "Bearer garbage");
        when(jwtService.parseAndValidate("garbage")).thenThrow(new JwtException("bad token"));

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getContentType()).startsWith("application/json");
        assertThat(response.getContentAsString()).contains("\"status\":401");
    }
}
