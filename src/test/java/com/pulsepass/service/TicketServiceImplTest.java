package com.pulsepass.service;

import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.entity.Event;
import com.pulsepass.entity.User;
import com.pulsepass.enums.EventStatus;
import com.pulsepass.enums.TicketType;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.mapper.TicketMapper;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {
    @Mock TicketRepository ticketRepository;
    @Mock UserRepository userRepository;
    @Mock EventRepository eventRepository;
    @Mock TicketMapper ticketMapper;
    @InjectMocks TicketServiceImpl ticketService;

    @Test
    void purchase_shouldRejectInactiveUser() {
        User user = new User(); user.setEmail("a@x.com"); user.setActive(false);
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.of(user));
        assertThatThrownBy(() -> ticketService.purchase(new PurchaseTicketRequest("a@x.com", "EV-1", TicketType.GENERAL)))
                .isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).findByEventCode(any());
    }

    @Test
    void purchase_shouldRejectDraftEvent() {
        User user = new User(); user.setEmail("a@x.com"); user.setActive(true);
        Event event = new Event(); event.setStatus(EventStatus.DRAFT); event.setEventDate(LocalDate.now().plusDays(2));
        when(userRepository.findByEmailIgnoreCase("a@x.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("EV-1")).thenReturn(Optional.of(event));
        assertThatThrownBy(() -> ticketService.purchase(new PurchaseTicketRequest("a@x.com", "EV-1", TicketType.GENERAL)))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }
}
