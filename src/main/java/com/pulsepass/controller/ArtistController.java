package com.pulsepass.controller;

import com.pulsepass.entity.Artist;
import com.pulsepass.service.ArtistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @GetMapping
    public ResponseEntity<List<Artist>> findAll() {
        return ResponseEntity.ok(artistService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Artist> findById(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.findById(id));
    }

    @GetMapping("/stage-name/{stageName}")
    public ResponseEntity<Artist> findByStageName(
            @PathVariable String stageName) {
        return ResponseEntity.ok(
                artistService.findByStageName(stageName));
    }

    @PostMapping
    public ResponseEntity<Artist> create(@RequestBody Artist artist) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(artistService.create(artist));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Artist> update(
            @PathVariable Long id,
            @RequestBody Artist artist) {
        return ResponseEntity.ok(
                artistService.update(id, artist));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        artistService.delete(id);
        return ResponseEntity.noContent().build();
    }
}