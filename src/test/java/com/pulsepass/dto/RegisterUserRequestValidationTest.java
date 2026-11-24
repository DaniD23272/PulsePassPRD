package com.pulsepass.dto;

import com.pulsepass.dto.request.RegisterUserRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * La contraseña debe tener entre 12 caracteres y 72 bytes UTF-8 (límite de
 * BCrypt). Todas las violaciones son errores de Bean Validation y por tanto
 * responden 400, antes de llegar al servicio.
 */
class RegisterUserRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    private Set<ConstraintViolation<RegisterUserRequest>> validate(String password) {
        return validator.validate(new RegisterUserRequest(
                "andrea", "andrea@email.com", "Andrea", "Diaz",
                null, null, LocalDate.of(1998, 5, 20), password));
    }

    @Test
    void password_of72AsciiBytes_isAccepted() {
        assertThat(validate("a".repeat(72))).isEmpty();
    }

    @Test
    void password_of73AsciiBytes_isRejected() {
        assertThat(validate("a".repeat(73))).isNotEmpty();
    }

    @Test
    void password_limitIsMeasuredInBytesNotCharacters() {
        // "á" ocupa 2 bytes en UTF-8: 36 caracteres = 72 bytes.
        assertThat(validate("á".repeat(36))).isEmpty();
        // 37 caracteres = 74 bytes, aunque solo sean 37 caracteres.
        assertThat(validate("á".repeat(37))).isNotEmpty();
    }

    @Test
    void validRequest_hasNoViolations() {
        assertThat(validate("PulsePassTest!2026")).isEmpty();
    }
}
