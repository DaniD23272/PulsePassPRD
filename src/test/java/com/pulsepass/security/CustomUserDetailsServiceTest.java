package com.pulsepass.security;

import com.pulsepass.entity.User;
import com.pulsepass.entity.UserCredential;
import com.pulsepass.entity.UserRole;
import com.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.UserRoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    UserRepository users;

    @Mock
    UserCredentialRepository credentials;

    @Mock
    UserRoleRepository roles;

    @InjectMocks
    CustomUserDetailsService service;

    private User activeUser() {
        User user = new User();
        user.setId(7L);
        user.setUsername("andrea");
        user.setEmail("andrea@email.com");
        user.setActive(true);
        return user;
    }

    @Test
    void loadUserByUsername_usesEmailLookupWhenIdentifierContainsAt() {
        User user = activeUser();
        when(users.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(user));
        when(credentials.findByUserId(7L))
                .thenReturn(Optional.of(new UserCredential(user, "hash")));
        when(roles.findAllByUserId(7L)).thenReturn(List.of(new UserRole(7L, "USER")));

        UserDetails details = service.loadUserByUsername("andrea@email.com");

        assertThat(details.getUsername()).isEqualTo("7");
    }

    @Test
    void loadUserByUsername_usesUsernameLookupWhenIdentifierHasNoAt() {
        User user = activeUser();
        when(users.findByUsernameIgnoreCase("andrea")).thenReturn(Optional.of(user));
        when(credentials.findByUserId(7L))
                .thenReturn(Optional.of(new UserCredential(user, "hash")));
        when(roles.findAllByUserId(7L)).thenReturn(List.of(new UserRole(7L, "USER")));

        UserDetails details = service.loadUserByUsername("andrea");

        assertThat(details.getUsername()).isEqualTo("7");
    }

    @Test
    void loadUserByUsername_trimsWhitespace() {
        User user = activeUser();
        when(users.findByUsernameIgnoreCase("andrea")).thenReturn(Optional.of(user));
        when(credentials.findByUserId(7L))
                .thenReturn(Optional.of(new UserCredential(user, "hash")));
        when(roles.findAllByUserId(7L)).thenReturn(List.of(new UserRole(7L, "USER")));

        UserDetails details = service.loadUserByUsername("  andrea  ");

        assertThat(details.getUsername()).isEqualTo("7");
    }

    @Test
    void loadUserByUsername_returnsAuthoritiesPrefixedWithRole() {
        User user = activeUser();
        when(users.findByUsernameIgnoreCase("andrea")).thenReturn(Optional.of(user));
        when(credentials.findByUserId(7L))
                .thenReturn(Optional.of(new UserCredential(user, "bcrypt-hash")));
        when(roles.findAllByUserId(7L))
                .thenReturn(List.of(new UserRole(7L, "USER"), new UserRole(7L, "ADMIN")));

        UserDetails details = service.loadUserByUsername("andrea");

        assertThat(details.getPassword()).isEqualTo("bcrypt-hash");
        assertThat(details.getAuthorities())
                .extracting(Object::toString)
                .containsExactlyInAnyOrder("ROLE_USER", "ROLE_ADMIN");
    }

    @Test
    void loadUserByUsername_rejectsUnknownIdentifier() {
        when(users.findByUsernameIgnoreCase("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("ghost"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void loadUserByUsername_rejectsInactiveUser() {
        User user = activeUser();
        user.setActive(false);
        when(users.findByUsernameIgnoreCase("andrea")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.loadUserByUsername("andrea"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void loadUserByUsername_rejectsUserWithoutCredential() {
        User user = activeUser();
        when(users.findByUsernameIgnoreCase("andrea")).thenReturn(Optional.of(user));
        when(credentials.findByUserId(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("andrea"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void loadUserByUsername_rejectsUserWithoutRoles() {
        User user = activeUser();
        when(users.findByUsernameIgnoreCase("andrea")).thenReturn(Optional.of(user));
        when(credentials.findByUserId(7L))
                .thenReturn(Optional.of(new UserCredential(user, "hash")));
        when(roles.findAllByUserId(7L)).thenReturn(List.of());

        assertThatThrownBy(() -> service.loadUserByUsername("andrea"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void loadUserById_returnsDetailsForExistingUser() {
        User user = activeUser();
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(credentials.findByUserId(7L))
                .thenReturn(Optional.of(new UserCredential(user, "hash")));
        when(roles.findAllByUserId(7L)).thenReturn(List.of(new UserRole(7L, "USER")));

        UserDetails details = service.loadUserById(7L);

        assertThat(details.getUsername()).isEqualTo("7");
    }

    @Test
    void loadUserById_rejectsUnknownId() {
        when(users.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserById(404L))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
