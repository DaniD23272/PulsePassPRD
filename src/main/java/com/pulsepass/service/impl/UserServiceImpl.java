package com.pulsepass.service.impl;

import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.entity.User;
import com.pulsepass.entity.UserCredential;
import com.pulsepass.entity.UserProfile;
import com.pulsepass.entity.UserRole;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.AgeRestrictionException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.UserMapper;
import com.pulsepass.repository.UserCredentialRepository;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.UserRoleRepository;
import com.pulsepass.service.UserService;
import com.pulsepass.util.AgePolicy;
import java.time.LocalDate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            UserCredentialRepository userCredentialRepository,
            UserRoleRepository userRoleRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.userRoleRepository = userRoleRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new DuplicateResourceException(
                    "Username already exists: " + request.username());
        }

        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException(
                    "Email already exists: " + request.email());
        }

        if (request.birthDate() != null
                && request.birthDate().isAfter(AgePolicy.today())) {
            throw new BusinessRuleException(
                    "Birth date cannot be in the future.");
        }
        if (!AgePolicy.meetsMinimumAge(request.birthDate())) {
            throw new AgeRestrictionException(
                    "You must be at least 16 years old to create an account.");
        }

        // La longitud de la contraseña (12 caracteres, 72 bytes UTF-8) se valida
        // en RegisterUserRequest (Bean Validation), antes de llegar aquí y
        // siempre con 400.

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setActive(true);

        UserProfile profile = new UserProfile();
        profile.setFirstName(request.firstName());
        profile.setLastName(request.lastName());
        profile.setPhone(request.phone());
        profile.setCity(request.city());
        profile.setBirthDate(request.birthDate());
        profile.setUser(user);
        user.setProfile(profile);

        User savedUser = userRepository.save(user);
        profile.setUser(savedUser);
        userProfileRepository.save(profile);

        UserCredential credential = new UserCredential(
                savedUser,
                passwordEncoder.encode(request.password()));
        userCredentialRepository.save(credential);

        UserRole role = new UserRole(savedUser.getId(), "USER");
        userRoleRepository.save(role);

        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        return userMapper.toResponse(
                userRepository.findByEmailIgnoreCase(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found: " + email)));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByUsername(String username) {
        return userMapper.toResponse(
                userRepository.findByUsername(username)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found: " + username)));
    }
}
