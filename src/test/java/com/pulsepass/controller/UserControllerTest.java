package com.pulsepass.controller;

import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import(GlobalExceptionHandler.class)
class UserControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    UserService userService;

    private static final String VALID_USER = """
            {
              "username":"andrea",
              "email":"andrea@email.com",
              "firstName":"Andrea",
              "lastName":"Diaz",
              "phone":"3000000000",
              "city":"Santa Marta",
              "birthDate":"2000-01-01"
            }
            """;

    @Test
    void register_valid_returns201() throws Exception {
        when(userService.register(any(RegisterUserRequest.class)))
                .thenReturn(null);

        mvc.perform(post("/api/users")
                        .contentType("application/json")
                        .content(VALID_USER))
                .andExpect(status().isCreated());

        verify(userService).register(any(RegisterUserRequest.class));
    }

    @Test
    void register_invalidEmail_returns400() throws Exception {
        String invalidUser = VALID_USER.replace(
                "andrea@email.com", "invalid-email");

        mvc.perform(post("/api/users")
                        .contentType("application/json")
                        .content(invalidUser))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verify(userService, never())
                .register(any(RegisterUserRequest.class));
    }

    @Test
    void register_duplicateUsername_returns409() throws Exception {
        when(userService.register(any(RegisterUserRequest.class)))
                .thenThrow(new DuplicateResourceException("Username already exists"));

        mvc.perform(post("/api/users")
                        .contentType("application/json")
                        .content(VALID_USER))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void findByEmail_returns200() throws Exception {
        when(userService.findByEmail("andrea@email.com")).thenReturn(null);

        mvc.perform(get("/api/users/by-email")
                        .param("email", "andrea@email.com"))
                .andExpect(status().isOk());

        verify(userService).findByEmail("andrea@email.com");
    }

    @Test
    void findByUsername_returns200() throws Exception {
        when(userService.findByUsername("andrea")).thenReturn(null);

        mvc.perform(get("/api/users/by-username")
                        .param("username", "andrea"))
                .andExpect(status().isOk());

        verify(userService).findByUsername("andrea");
    }

    @Test
    void findByEmail_missing_returns404() throws Exception {
        when(userService.findByEmail("missing@email.com"))
                .thenThrow(new ResourceNotFoundException("User not found"));

        mvc.perform(get("/api/users/by-email")
                        .param("email", "missing@email.com"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}