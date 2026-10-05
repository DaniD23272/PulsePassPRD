package com.pulsepass.service;

import com.pulsepass.entity.User;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setActive(true);
    }

    @Test
    void findById_shouldReturnUser_whenUserExists() {
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        User result = userService.findById(1L);

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository).findById(1L);
    }

    @Test
    void findById_shouldThrowException_whenUserDoesNotExist() {
        when(userRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.findById(1L)
        );
    }

    @Test
    void create_shouldSaveUser_whenEmailIsAvailable() {
        when(userRepository.findByEmailIgnoreCase("test@example.com"))
                .thenReturn(Optional.empty());

        when(userRepository.save(user))
                .thenReturn(user);

        User result = userService.create(user);

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository).save(user);
    }

    @Test
    void create_shouldThrowException_whenEmailAlreadyExists() {
        when(userRepository.findByEmailIgnoreCase("test@example.com"))
                .thenReturn(Optional.of(user));

        assertThrows(
                BusinessRuleException.class,
                () -> userService.create(user)
        );

        verify(userRepository, never()).save(any(User.class));
    }
}