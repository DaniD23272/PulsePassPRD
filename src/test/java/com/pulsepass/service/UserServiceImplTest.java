package com.pulsepass.service;

import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.entity.User;
import com.pulsepass.entity.UserProfile;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.mapper.UserMapper;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {
    @Mock UserRepository userRepository;
    @Mock UserProfileRepository userProfileRepository;
    @Mock UserMapper userMapper;
    @InjectMocks UserServiceImpl userService;

    @Test
    void register_shouldCreateUserAndProfile() {
        RegisterUserRequest request = new RegisterUserRequest("andrea", "andrea@email.com", "Andrea", "Diaz", "300", "Santa Marta", LocalDate.now().minusYears(25));
        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@email.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(i -> i.getArgument(0));
        when(userMapper.toResponse(any(User.class))).thenReturn(mock(UserResponse.class));

        userService.register(request);
        verify(userRepository).save(any(User.class));
        verify(userProfileRepository).save(any(UserProfile.class));
    }

    @Test
    void register_shouldRejectDuplicateUsername() {
        when(userRepository.existsByUsername("andrea")).thenReturn(true);
        RegisterUserRequest request = new RegisterUserRequest("andrea", "a@x.com", "A", "B", null, null, null);
        assertThatThrownBy(() -> userService.register(request)).isInstanceOf(DuplicateResourceException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_shouldRejectFutureBirthDate() {
        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("a@x.com")).thenReturn(false);
        RegisterUserRequest request = new RegisterUserRequest("andrea", "a@x.com", "A", "B", null, null, LocalDate.now().plusDays(1));
        assertThatThrownBy(() -> userService.register(request)).isInstanceOf(BusinessRuleException.class);
    }
}
