package com.pulsepass.controller;

import com.pulsepass.entity.Event;
import com.pulsepass.enums.EventStatus;
import com.pulsepass.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<Event>> findAll() {
        return ResponseEntity.ok(eventService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> findById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    @GetMapping("/code/{eventCode}")
    public ResponseEntity<Event> findByEventCode(
            @PathVariable String eventCode) {
        return ResponseEntity.ok(
                eventService.findByEventCode(eventCode));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Event>> findByStatus(
            @PathVariable EventStatus status) {
        return ResponseEntity.ok(
                eventService.findByStatus(status));
    }

    @GetMapping("/venue/{code}")
    public ResponseEntity<List<Event>> findByVenueCode(
            @PathVariable String code) {
        return ResponseEntity.ok(
                eventService.findByVenueCode(code));
    }

    @PostMapping
    public ResponseEntity<Event> create(@RequestBody Event event) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(eventService.create(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> update(
            @PathVariable Long id,
            @RequestBody Event event) {
        return ResponseEntity.ok(
                eventService.update(id, event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.noContent().build();
    }
}