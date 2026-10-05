package com.pulsepass.service;

import com.pulsepass.entity.Ticket;
import com.pulsepass.enums.TicketStatus;

import java.util.List;

public interface TicketService {

    List<Ticket> findAll();

    Ticket findById(Long id);

    List<Ticket> findByUserEmail(String email, TicketStatus status);

    List<Ticket> findByEventCode(String eventCode, TicketStatus status);

    Ticket create(Ticket ticket);

    Ticket update(Long id, Ticket ticket);

    void delete(Long id);
}