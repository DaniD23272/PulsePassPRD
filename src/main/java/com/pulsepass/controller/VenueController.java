package com.pulsepass.controller;

import com.pulsepass.entity.Venue;
import com.pulsepass.service.VenueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @GetMapping
    public ResponseEntity<List<Venue>> findAll() {
        return ResponseEntity.ok(venueService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> findById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.findById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Venue> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(venueService.findByCode(code));
    }

    @PostMapping
    public ResponseEntity<Venue> create(@RequestBody Venue venue) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(venueService.create(venue));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venue> update(
            @PathVariable Long id,
            @RequestBody Venue venue) {
        return ResponseEntity.ok(venueService.update(id, venue));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        venueService.delete(id);
        return ResponseEntity.noContent().build();
    }
}