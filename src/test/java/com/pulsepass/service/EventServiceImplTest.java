package com.pulsepass.service;

import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.entity.Event;
import com.pulsepass.entity.Venue;
import com.pulsepass.enums.EventCategory;
import com.pulsepass.enums.EventStatus;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.EventMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.impl.EventServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {
    @Mock EventRepository eventRepository;
    @Mock VenueRepository venueRepository;
    @Mock ArtistRepository artistRepository;
    @Mock EventMapper eventMapper;
    @InjectMocks EventServiceImpl eventService;

    @Test
    void create_shouldSaveValidEvent() {
        Venue venue = new Venue(); venue.setCode("VEN-1"); venue.setActive(true);
        CreateEventRequest request = new CreateEventRequest("EV-1", "Concert", "desc", EventCategory.MUSIC,
                LocalDateTime.now().plusDays(10), 18, "VEN-1");
        Event saved = new Event(); saved.setEventCode("EV-1");
        EventResponse response = mock(EventResponse.class);
        when(eventRepository.existsByEventCode("EV-1")).thenReturn(false);
        when(venueRepository.findByCode("VEN-1")).thenReturn(Optional.of(venue));
        when(eventRepository.save(any(Event.class))).thenReturn(saved);
        when(eventMapper.toResponse(saved)).thenReturn(response);

        assertThat(eventService.create(request)).isSameAs(response);
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    void create_shouldRejectInactiveVenue() {
        Venue venue = new Venue(); venue.setCode("VEN-1"); venue.setActive(false);
        CreateEventRequest request = new CreateEventRequest("EV-1", "Concert", "desc", EventCategory.MUSIC,
                LocalDateTime.now().plusDays(10), 18, "VEN-1");
        when(eventRepository.existsByEventCode("EV-1")).thenReturn(false);
        when(venueRepository.findByCode("VEN-1")).thenReturn(Optional.of(venue));

        assertThatThrownBy(() -> eventService.create(request)).isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).save(any());
    }

    @Test
    void findByCode_shouldThrowWhenMissing() {
        when(eventRepository.findByEventCode("EV-1")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> eventService.findByCode("EV-1")).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void publish_shouldChangeDraftToPublished() {
        Event event = new Event(); event.setEventCode("EV-1"); event.setStatus(EventStatus.DRAFT);
        event.setEventDate(LocalDate.now().plusDays(2));
        Venue venue = new Venue(); venue.setActive(true); event.setVenue(venue);
        when(eventRepository.findByEventCode("EV-1")).thenReturn(Optional.of(event));
        when(eventRepository.save(event)).thenReturn(event);
        when(eventMapper.toResponse(event)).thenReturn(mock(EventResponse.class));

        eventService.publish("EV-1");
        assertThat(event.getStatus()).isEqualTo(EventStatus.PUBLISHED);
        verify(eventRepository).save(event);
    }
}
