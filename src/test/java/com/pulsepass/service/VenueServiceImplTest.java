package com.pulsepass.service;

import com.pulsepass.dto.response.VenueResponse;
import com.pulsepass.entity.Venue;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.VenueMapper;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.impl.VenueServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VenueServiceImplTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VenueMapper venueMapper;

    @InjectMocks
    private VenueServiceImpl venueService;

    private Venue venue;
    private VenueResponse venueResponse;

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

        venueResponse = new VenueResponse(
                1L,
                "VEN-001",
                "Main Venue",
                "Santa Marta",
                "Carrera 1",
                1000,
                true
        );
    }

    @Test
    void findByCode_shouldReturnDto_whenVenueExists() {

        when(venueRepository.findByCode("VEN-001"))
                .thenReturn(Optional.of(venue));

        when(venueMapper.toResponse(venue))
                .thenReturn(venueResponse);

        VenueResponse result =
                venueService.findByCode("VEN-001");

        assertThat(result).isEqualTo(venueResponse);

        verify(venueRepository)
                .findByCode("VEN-001");

        verify(venueMapper)
                .toResponse(venue);
    }

    @Test
    void findByCode_shouldThrowException_whenVenueDoesNotExist() {

        when(venueRepository.findByCode("VEN-999"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                venueService.findByCode("VEN-999")
        )
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("VEN-999");

        verify(venueRepository)
                .findByCode("VEN-999");
    }

    @Test
    void findActiveVenues_shouldReturnMappedDtos() {

        when(venueRepository.findByActiveTrueOrderByNameAsc())
                .thenReturn(List.of(venue));

        when(venueMapper.toResponse(venue))
                .thenReturn(venueResponse);

        List<VenueResponse> result =
                venueService.findActiveVenues();

        assertThat(result)
                .containsExactly(venueResponse);

        verify(venueRepository)
                .findByActiveTrueOrderByNameAsc();

        verify(venueMapper)
                .toResponse(venue);
    }
}
