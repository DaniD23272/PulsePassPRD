package com.pulsepass.service;

import com.pulsepass.entity.Venue;

import java.util.List;

public interface VenueService {

    List<Venue> findAll();

    Venue findById(Long id);

    Venue findByCode(String code);

    Venue create(Venue venue);

    Venue update(Long id, Venue venue);

    void delete(Long id);
}