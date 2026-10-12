package com.pulsepass.controller;

import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TicketController.class)
@Import(GlobalExceptionHandler.class)
class TicketControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    TicketService ticketService;

    private static final String VALID_TICKET = """
            {
              "userEmail":"andrea@email.com",
              "eventCode":"CMF-2027",
              "type":"GENERAL"
            }
            """;

    @Test
    void purchase_valid_returns201() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenReturn(null);

        mvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_TICKET))
                .andExpect(status().isCreated());

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void purchase_invalidEmail_returns400() throws Exception {
        String invalid = VALID_TICKET.replace(
                "andrea@email.com", "invalid-email");

        mvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verify(ticketService, never())
                .purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void findByCode_missing_returns404() throws Exception {
        when(ticketService.findByCode("MISSING"))
                .thenThrow(new ResourceNotFoundException("Ticket not found: MISSING"));

        mvc.perform(get("/api/tickets/MISSING"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void findByUserEmail_returns200() throws Exception {
        when(ticketService.findByUserEmail("andrea@email.com"))
                .thenReturn(List.of());

        mvc.perform(get("/api/tickets/by-user")
                        .param("email", "andrea@email.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void cancel_invalidTransition_returns409() throws Exception {
        when(ticketService.cancel("TCK-USED"))
                .thenThrow(new BusinessRuleException("Used tickets cannot be cancelled"));

        mvc.perform(patch("/api/tickets/TCK-USED/cancel"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void markAsUsed_cancelledTicket_returns409() throws Exception {
        when(ticketService.markAsUsed("TCK-CANCELLED"))
                .thenThrow(new BusinessRuleException("Cancelled tickets cannot be used"));

        mvc.perform(patch("/api/tickets/TCK-CANCELLED/use"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }
}