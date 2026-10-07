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

import java.util.List;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import static org.mockito.Mockito.mock;

import static org.mockito.Mockito.verify;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)

class ArtistServiceImplTest {

    @Mock

    ArtistRepository artistRepository;

    @Mock

    ArtistMapper artistMapper;

    @InjectMocks

    ArtistServiceImpl artistService;

    @Test

    void findById_shouldReturnDto() {

        Artist artist = new Artist();

        artist.setId(1L);

        ArtistResponse response = mock(ArtistResponse.class);

        when(artistRepository.findById(1L))

                .thenReturn(Optional.of(artist));

        when(artistMapper.toResponse(artist))

                .thenReturn(response);

        ArtistResponse result = artistService.findById(1L);

        assertThat(result).isSameAs(response);

        verify(artistRepository).findById(1L);

        verify(artistMapper).toResponse(artist);

    }

    @Test

    void findById_shouldThrowWhenMissing() {

        when(artistRepository.findById(1L))

                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> artistService.findById(1L))

                .isInstanceOf(ResourceNotFoundException.class);

    }

    @Test

    void findByStageName_shouldReturnDto() {

        Artist artist = new Artist();

        artist.setId(1L);

        artist.setStageName("The Artist");

        ArtistResponse response = mock(ArtistResponse.class);

        when(artistRepository.findByStageNameIgnoreCase("The Artist"))

                .thenReturn(Optional.of(artist));

        when(artistMapper.toResponse(artist))

                .thenReturn(response);

        ArtistResponse result =

                artistService.findByStageName("The Artist");

        assertThat(result).isSameAs(response);

        verify(artistRepository)

                .findByStageNameIgnoreCase("The Artist");

        verify(artistMapper)

                .toResponse(artist);

    }

    @Test

    void findByStageName_shouldThrowWhenMissing() {

        when(artistRepository.findByStageNameIgnoreCase("Unknown"))

                .thenReturn(Optional.empty());

        assertThatThrownBy(

                () -> artistService.findByStageName("Unknown")

        )

                .isInstanceOf(ResourceNotFoundException.class);

    }

    @Test

    void findActiveArtists_shouldReturnDtos() {

        Artist artist = new Artist();

        artist.setId(1L);

        artist.setStageName("The Artist");

        ArtistResponse response = mock(ArtistResponse.class);

        when(artistRepository.findByActiveTrueOrderByStageNameAsc())

                .thenReturn(List.of(artist));

        when(artistMapper.toResponse(artist))

                .thenReturn(response);

        List<ArtistResponse> result =

                artistService.findActiveArtists();

        assertThat(result)

                .containsExactly(response);

        verify(artistRepository)

                .findByActiveTrueOrderByStageNameAsc();

        verify(artistMapper)

                .toResponse(artist);

    }

}
