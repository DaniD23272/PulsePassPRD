package com.pulsepass.exception;

import com.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Dos errores del propio framework que el manejador global aún no traduce a
 * su código HTTP: una ruta inexistente (debería ser 404) y un método no
 * admitido sobre una ruta que sí existe (debería ser 405). Hoy ambos caen en
 * el manejador genérico de Exception y responden 500.
 */
@WebMvcTest(controllers = GlobalExceptionHandlerTest.StubController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, GlobalExceptionHandlerTest.StubController.class})
class GlobalExceptionHandlerTest {

    @RestController
    static class StubController {
        @GetMapping("/stub/{id}")
        String stub(@PathVariable String id) {
            return id;
        }
    }

    @Autowired
    MockMvc mvc;

    @MockitoBean
    JwtService jwtService;

    @MockitoBean
    CustomUserDetailsService customUserDetailsService;

    @Test
    void unknownRoute_returns404() throws Exception {
        mvc.perform(get("/stub/no-existe/otro-tramo"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void methodNotSupported_returns405() throws Exception {
        mvc.perform(delete("/stub/1"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(405));
    }
}
