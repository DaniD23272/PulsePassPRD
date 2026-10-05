package com.pulsepass.service;

import com.pulsepass.entity.Venue;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.impl.VenueServiceImpl;
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
class VenueServiceImplTest {

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private VenueServiceImpl venueService;

    private Venue venue;

    @BeforeEach
    void setUp() {
        venue = new Venue();
        venue.setId(1L);
        venue.setCode("VEN-001");
        venue.setName("Main Venue");
        venue.setCity("Santa Marta");
        venue.setAddress("Carrera 1");
        venue.setCapacity(1000);
        venue.setActive(true);
    }

    @Test
    void findById_shouldReturnVenue_whenVenueExists() {
        when(venueRepository.findById(1L))
                .thenReturn(Optional.of(venue));

        Venue result = venueService.findById(1L);

        assertNotNull(result);
        assertEquals("VEN-001", result.getCode());
        verify(venueRepository).findById(1L);
    }

    @Test
    void findById_shouldThrowException_whenVenueDoesNotExist() {
        when(venueRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> venueService.findById(1L)
        );
    }

    @Test
    void create_shouldSaveVenue_whenCodeIsAvailable() {
        when(venueRepository.findByCode("VEN-001"))
                .thenReturn(Optional.empty());

        when(venueRepository.save(venue))
                .thenReturn(venue);

        Venue result = venueService.create(venue);

        assertNotNull(result);
        assertEquals("VEN-001", result.getCode());
        verify(venueRepository).save(venue);
    }

    @Test
    void create_shouldThrowException_whenCodeAlreadyExists() {
        when(venueRepository.findByCode("VEN-001"))
                .thenReturn(Optional.of(venue));

        assertThrows(
                BusinessRuleException.class,
                () -> venueService.create(venue)
        );

        verify(venueRepository, never()).save(any(Venue.class));
    }
}