package com.pulsepass.service.impl;

import com.pulsepass.dto.response.VenueResponse;
import com.pulsepass.entity.Venue;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.VenueMapper;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.VenueService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class VenueServiceImpl implements VenueService {
    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;

    public VenueServiceImpl(VenueRepository venueRepository, VenueMapper venueMapper) {
        this.venueRepository = venueRepository;
        this.venueMapper = venueMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponse findByCode(String code) {
        Venue venue = venueRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found: " + code));
        return venueMapper.toResponse(venue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse> findActiveVenues() {
        return venueRepository.findByActiveTrueOrderByNameAsc()
                .stream().map(venueMapper::toResponse).toList();
    }
}
