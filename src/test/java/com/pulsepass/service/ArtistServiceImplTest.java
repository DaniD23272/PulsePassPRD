package com.pulsepass.service;

import com.pulsepass.entity.Artist;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.service.impl.ArtistServiceImpl;
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
class ArtistServiceImplTest {

    @Mock
    private ArtistRepository artistRepository;

    @InjectMocks
    private ArtistServiceImpl artistService;

    private Artist artist;

    @BeforeEach
    void setUp() {
        artist = new Artist();
        artist.setId(1L);
        artist.setStageName("Test Artist");
        artist.setCountry("Colombia");
        artist.setGenre("Pop");
        artist.setActive(true);
    }

    @Test
    void findById_shouldReturnArtist_whenArtistExists() {
        when(artistRepository.findById(1L))
                .thenReturn(Optional.of(artist));

        Artist result = artistService.findById(1L);

        assertNotNull(result);
        assertEquals("Test Artist", result.getStageName());

        verify(artistRepository).findById(1L);
    }

    @Test
    void findById_shouldThrowException_whenArtistDoesNotExist() {
        when(artistRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> artistService.findById(1L)
        );
    }

    @Test
    void create_shouldSaveArtist_whenStageNameIsAvailable() {
        when(artistRepository.findByStageName("Test Artist"))
                .thenReturn(Optional.empty());

        when(artistRepository.save(artist))
                .thenReturn(artist);

        Artist result = artistService.create(artist);

        assertNotNull(result);
        assertEquals("Test Artist", result.getStageName());

        verify(artistRepository).save(artist);
    }

    @Test
    void create_shouldThrowException_whenStageNameAlreadyExists() {
        when(artistRepository.findByStageName("Test Artist"))
                .thenReturn(Optional.of(artist));

        assertThrows(
                BusinessRuleException.class,
                () -> artistService.create(artist)
        );

        verify(artistRepository, never()).save(any(Artist.class));
    }
}