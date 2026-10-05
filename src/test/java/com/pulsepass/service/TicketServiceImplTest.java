package com.pulsepass.service;

import com.pulsepass.entity.Ticket;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.service.impl.TicketServiceImpl;
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
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private Ticket ticket;

    @BeforeEach
    void setUp() {
        ticket = mock(Ticket.class);
    }

    @Test
    void findById_shouldReturnTicket_whenTicketExists() {
        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        Ticket result = ticketService.findById(1L);

        assertNotNull(result);
        assertEquals(ticket, result);
        verify(ticketRepository).findById(1L);
    }

    @Test
    void findById_shouldThrowException_whenTicketDoesNotExist() {
        when(ticketRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> ticketService.findById(1L)
        );
    }

    @Test
    void create_shouldSaveTicket() {
        when(ticketRepository.save(ticket))
                .thenReturn(ticket);

        Ticket result = ticketService.create(ticket);

        assertNotNull(result);
        assertEquals(ticket, result);
        verify(ticketRepository).save(ticket);
    }

    @Test
    void delete_shouldDeleteExistingTicket() {
        when(ticketRepository.findById(1L))
                .thenReturn(Optional.of(ticket));

        ticketService.delete(1L);

        verify(ticketRepository).delete(ticket);
    }
}