package com.pulsepass;

import com.pulsepass.entity.User;
import com.pulsepass.entity.UserProfile;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Transactional
class UserProfileIT {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Test
    void shouldPersistUserWithUserProfile() {

        User user = new User();

        user.setUsername("profile-user-01");
        user.setEmail("profile01@test.com");
        user.setActive(true);

        user = userRepository.saveAndFlush(user);

        UserProfile profile = new UserProfile();

        profile.setFirstName("Sara");
        profile.setLastName("Test");
        profile.setPhone("3001234567");
        profile.setCity("Santa Marta");
        profile.setBirthDate(LocalDate.of(2000, 1, 15));
        profile.setUser(user);

        UserProfile savedProfile = userProfileRepository.saveAndFlush(profile);
        assertNotNull(savedProfile.getId());

        UserProfile result = userProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AssertionError("No se encontró el perfil guardado"));

        assertEquals(user.getId(), result.getUser().getId());
        assertEquals("Sara", result.getFirstName());
        assertEquals("Test", result.getLastName());
        assertEquals("Santa Marta", result.getCity());
        assertEquals(LocalDate.of(2000, 1, 15), result.getBirthDate());
    }
}