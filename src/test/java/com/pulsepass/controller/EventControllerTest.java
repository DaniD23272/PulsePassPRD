package com.pulsepass.controller;

import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.EventService;
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

@WebMvcTest(EventController.class)
@Import(GlobalExceptionHandler.class)
class EventControllerTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    EventService eventService;

    @MockitoBean
    TicketService ticketService;

    private static final String VALID_EVENT = """
            {
              "eventCode":"CMF-2027",
              "name":"Caribbean Music Fest",
              "description":"Music festival",
              "category":"MUSIC",
              "eventDate":"2027-12-20T19:00:00",
              "minimumAge":18,
              "venueCode":"VEN-SMR-01"
            }
            """;

    @Test
    void create_valid_returns201() throws Exception {
        when(eventService.create(any(CreateEventRequest.class))).thenReturn(null);

        mvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_EVENT))
                .andExpect(status().isCreated());

        verify(eventService).create(any(CreateEventRequest.class));
    }

    @Test
    void create_invalid_returns400() throws Exception {
        String invalidEvent = """
                {
                  "eventCode":"",
                  "name":"",
                  "category":null,
                  "eventDate":null,
                  "minimumAge":-1,
                  "venueCode":""
                }
                """;

        mvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidEvent))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verify(eventService, never()).create(any(CreateEventRequest.class));
    }

    @Test
    void findByCode_missing_returns404() throws Exception {
        when(eventService.findByCode("UNKNOWN"))
                .thenThrow(new ResourceNotFoundException("Event not found: UNKNOWN"));

        mvc.perform(get("/api/events/UNKNOWN"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void findPublishedEvents_returns200() throws Exception {
        when(eventService.findPublishedEvents()).thenReturn(List.of());

        mvc.perform(get("/api/events/published"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void publish_valid_returns200() throws Exception {
        when(eventService.publish("CMF-2027")).thenReturn(null);

        mvc.perform(patch("/api/events/CMF-2027/publish"))
                .andExpect(status().isOk());

        verify(eventService).publish("CMF-2027");
    }

    @Test
    void publish_invalid_returns409() throws Exception {
        when(eventService.publish("CANCELLED-EVENT"))
                .thenThrow(new BusinessRuleException("Event cannot be published"));

        mvc.perform(patch("/api/events/CANCELLED-EVENT/publish"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void addArtist_returns200() throws Exception {
        when(eventService.addArtist("CMF-2027", 7L)).thenReturn(null);

        mvc.perform(post("/api/events/CMF-2027/artists/7"))
                .andExpect(status().isOk());

        verify(eventService).addArtist("CMF-2027", 7L);
    }

    @Test
    void findByArtist_returns200() throws Exception {
        when(eventService.findByArtist("Solar Beat")).thenReturn(List.of());

        mvc.perform(get("/api/events/by-artist")
                        .param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void findPaidTicketsByEvent_returns200() throws Exception {
        when(ticketService.findPaidTicketsByEvent("CMF-2027"))
                .thenReturn(List.of());

        mvc.perform(get("/api/events/CMF-2027/tickets/paid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(ticketService).findPaidTicketsByEvent("CMF-2027");
    }
}