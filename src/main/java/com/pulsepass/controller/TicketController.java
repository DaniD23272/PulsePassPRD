package com.pulsepass.controller;

import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    private final TicketService ticketService;
    public TicketController(TicketService ticketService) { this.ticketService = ticketService; }
    @PostMapping
    public ResponseEntity<TicketResponse> purchase(@RequestBody PurchaseTicketRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.purchase(request)); }
    @GetMapping("/{ticketCode}")
    public ResponseEntity<TicketResponse> findByCode(@PathVariable String ticketCode) { return ResponseEntity.ok(ticketService.findByCode(ticketCode)); }
    @GetMapping("/user/{email}")
    public ResponseEntity<List<TicketResponse>> findByUserEmail(@PathVariable String email) { return ResponseEntity.ok(ticketService.findByUserEmail(email)); }
    @GetMapping("/event/{eventCode}/paid")
    public ResponseEntity<List<TicketResponse>> findPaidTicketsByEvent(@PathVariable String eventCode) { return ResponseEntity.ok(ticketService.findPaidTicketsByEvent(eventCode)); }
    @PutMapping("/{ticketCode}/cancel")
    public ResponseEntity<TicketResponse> cancel(@PathVariable String ticketCode) { return ResponseEntity.ok(ticketService.cancel(ticketCode)); }
    @PutMapping("/{ticketCode}/use")
    public ResponseEntity<TicketResponse> markAsUsed(@PathVariable String ticketCode) { return ResponseEntity.ok(ticketService.markAsUsed(ticketCode)); }
}
