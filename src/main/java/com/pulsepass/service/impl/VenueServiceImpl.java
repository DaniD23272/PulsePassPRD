package com.pulsepass.service.impl;

import com.pulsepass.entity.Venue;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.VenueService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;

    public VenueServiceImpl(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    @Override
    public List<Venue> findAll() {
        return venueRepository.findAll();
    }

    @Override
    public Venue findById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Venue not found with id: " + id));
    }

    @Override
    public Venue findByCode(String code) {
        return venueRepository.findByCode(code)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Venue not found with code: " + code));
    }

    @Override
    public Venue create(Venue venue) {

        if (venueRepository.findByCode(venue.getCode()).isPresent()) {
            throw new BusinessRuleException(
                    "A venue with code '" +
                            venue.getCode() +
                            "' already exists.");
        }

        if (venue.getActive() == null) {
            venue.setActive(true);
        }

        return venueRepository.save(venue);
    }

    @Override
    public Venue update(Long id, Venue venue) {

        Venue existingVenue = findById(id);

        venueRepository.findByCode(venue.getCode())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BusinessRuleException(
                            "A venue with code '" +
                                    venue.getCode() +
                                    "' already exists.");
                });

        existingVenue.setCode(venue.getCode());
        existingVenue.setName(venue.getName());
        existingVenue.setCity(venue.getCity());
        existingVenue.setAddress(venue.getAddress());
        existingVenue.setCapacity(venue.getCapacity());
        existingVenue.setActive(venue.getActive());

        return venueRepository.save(existingVenue);
    }

    @Override
    public void delete(Long id) {
        Venue venue = findById(id);
        venueRepository.delete(venue);
    }
}