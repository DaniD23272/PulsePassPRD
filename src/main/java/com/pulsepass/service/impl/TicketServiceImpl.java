package com.pulsepass.service.impl;

import com.pulsepass.entity.Ticket;
import com.pulsepass.enums.TicketStatus;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.service.TicketService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;

    public TicketServiceImpl(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Override
    public List<Ticket> findAll() {
        return ticketRepository.findAll();
    }

    @Override
    public Ticket findById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ticket not found with id: " + id));
    }

    @Override
    public List<Ticket> findByUserEmail(String email, TicketStatus status) {
        return ticketRepository.findByUserEmailAndStatus(email, status);
    }

    @Override
    public List<Ticket> findByEventCode(String eventCode, TicketStatus status) {
        return ticketRepository.findByEventEventCodeAndStatus(eventCode, status);
    }

    @Override
    public Ticket create(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    @Override
    public Ticket update(Long id, Ticket ticket) {

        Ticket existingTicket = findById(id);

        existingTicket.setTicketCode(ticket.getTicketCode());
        existingTicket.setType(ticket.getType());
        existingTicket.setPrice(ticket.getPrice());
        existingTicket.setStatus(ticket.getStatus());
        existingTicket.setPurchaseDate(ticket.getPurchaseDate());
        existingTicket.setUser(ticket.getUser());
        existingTicket.setEvent(ticket.getEvent());

        return ticketRepository.save(existingTicket);
    }

    @Override
    public void delete(Long id) {
        Ticket ticket = findById(id);
        ticketRepository.delete(ticket);
    }
}