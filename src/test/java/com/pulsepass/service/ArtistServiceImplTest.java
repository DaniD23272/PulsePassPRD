package com.pulsepass.service;

import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.entity.Artist;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.ArtistMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.service.impl.ArtistServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArtistServiceImplTest {
    @Mock ArtistRepository artistRepository;
    @Mock ArtistMapper artistMapper;
    @InjectMocks ArtistServiceImpl artistService;

    @Test
    void findById_shouldReturnDto() {
        Artist artist = new Artist(); artist.setId(1L);
        when(artistRepository.findById(1L)).thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(mock(ArtistResponse.class));
        artistService.findById(1L);
        verify(artistMapper).toResponse(artist);
    }

    @Test
    void findById_shouldThrowWhenMissing() {
        when(artistRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> artistService.findById(1L)).isInstanceOf(ResourceNotFoundException.class);
    }
}
