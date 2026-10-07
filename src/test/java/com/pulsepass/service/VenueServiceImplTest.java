package com.pulsepass.service;

import com.pulsepass.dto.response.VenueResponse;
import com.pulsepass.entity.Venue;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.VenueMapper;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.impl.VenueServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceImplTest {
    @Mock VenueRepository venueRepository;
    @Mock VenueMapper venueMapper;
    @InjectMocks VenueServiceImpl venueService;

    @Test
    void findByCode_shouldMapVenue() {
        Venue venue = new Venue(); venue.setCode("VEN-1");
        when(venueRepository.findByCode("VEN-1")).thenReturn(Optional.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(mock(VenueResponse.class));
        venueService.findByCode("VEN-1");
        verify(venueMapper).toResponse(venue);
    }

    @Test
    void findByCode_shouldThrowWhenMissing() {
        when(venueRepository.findByCode("VEN-1")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> venueService.findByCode("VEN-1")).isInstanceOf(ResourceNotFoundException.class);
    }
}
