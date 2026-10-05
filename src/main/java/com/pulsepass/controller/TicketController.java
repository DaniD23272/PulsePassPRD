package com.pulsepass.controller;

import com.pulsepass.entity.Ticket;
import com.pulsepass.enums.TicketStatus;
import com.pulsepass.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> findAll() {
        return ResponseEntity.ok(ticketService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.findById(id));
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Ticket>> findByUserEmail(
            @PathVariable String email,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(
                ticketService.findByUserEmail(email, status));
    }

    @GetMapping("/event/{eventCode}")
    public ResponseEntity<List<Ticket>> findByEventCode(
            @PathVariable String eventCode,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(
                ticketService.findByEventCode(eventCode, status));
    }

    @PostMapping
    public ResponseEntity<Ticket> create(@RequestBody Ticket ticket) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ticketService.create(ticket));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> update(
            @PathVariable Long id,
            @RequestBody Ticket ticket) {
        return ResponseEntity.ok(
                ticketService.update(id, ticket));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ticketService.delete(id);
        return ResponseEntity.noContent().build();
    }
}