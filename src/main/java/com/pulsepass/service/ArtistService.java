package com.pulsepass.service;

import com.pulsepass.entity.Artist;

import java.util.List;

public interface ArtistService {

    List<Artist> findAll();

    Artist findById(Long id);

    Artist findByStageName(String stageName);

    Artist create(Artist artist);

    Artist update(Long id, Artist artist);

    void delete(Long id);
}