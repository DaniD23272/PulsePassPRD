package com.pulsepass.controller;

import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;
    public EventController(EventService eventService) { this.eventService = eventService; }

    @PostMapping
    public ResponseEntity<EventResponse> create(@RequestBody CreateEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.create(request));
    }
    @GetMapping("/{eventCode}")
    public ResponseEntity<EventResponse> findByCode(@PathVariable String eventCode) { return ResponseEntity.ok(eventService.findByCode(eventCode)); }
    @GetMapping
    public ResponseEntity<List<EventSummaryResponse>> findPublishedEvents() { return ResponseEntity.ok(eventService.findPublishedEvents()); }
    @PutMapping("/{eventCode}/publish")
    public ResponseEntity<EventResponse> publish(@PathVariable String eventCode) { return ResponseEntity.ok(eventService.publish(eventCode)); }
    @PostMapping("/{eventCode}/artists/{artistId}")
    public ResponseEntity<EventResponse> addArtist(@PathVariable String eventCode, @PathVariable Long artistId) { return ResponseEntity.ok(eventService.addArtist(eventCode, artistId)); }
    @GetMapping("/artist/{stageName}")
    public ResponseEntity<List<EventSummaryResponse>> findByArtist(@PathVariable String stageName) { return ResponseEntity.ok(eventService.findByArtist(stageName)); }
}
