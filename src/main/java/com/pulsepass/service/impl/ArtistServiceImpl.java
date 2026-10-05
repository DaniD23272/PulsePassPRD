package com.pulsepass.service.impl;

import com.pulsepass.entity.Artist;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.service.ArtistService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArtistServiceImpl implements ArtistService {

    private final ArtistRepository artistRepository;

    public ArtistServiceImpl(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    @Override
    public List<Artist> findAll() {
        return artistRepository.findAll();
    }

    @Override
    public Artist findById(Long id) {
        return artistRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Artist not found with id: " + id));
    }

    @Override
    public Artist findByStageName(String stageName) {
        return artistRepository.findByStageName(stageName)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Artist not found with stage name: " + stageName));
    }

    @Override
    public Artist create(Artist artist) {

        if (artistRepository.findByStageName(artist.getStageName()).isPresent()) {
            throw new BusinessRuleException(
                    "An artist with stage name '" +
                            artist.getStageName() +
                            "' already exists.");
        }

        if (artist.getActive() == null) {
            artist.setActive(true);
        }

        return artistRepository.save(artist);
    }

    @Override
    public Artist update(Long id, Artist artist) {

        Artist existingArtist = findById(id);

        artistRepository.findByStageName(artist.getStageName())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessRuleException(
                            "An artist with stage name '" +
                                    artist.getStageName() +
                                    "' already exists.");
                });

        existingArtist.setStageName(artist.getStageName());
        existingArtist.setCountry(artist.getCountry());
        existingArtist.setGenre(artist.getGenre());
        existingArtist.setActive(artist.getActive());

        return artistRepository.save(existingArtist);
    }

    @Override
    public void delete(Long id) {
        Artist artist = findById(id);
        artistRepository.delete(artist);
    }
}