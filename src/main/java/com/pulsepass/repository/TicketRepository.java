package com.pulsepass.repository;

import com.pulsepass.entity.Ticket;
import com.pulsepass.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketCode(String ticketCode);
    List<Ticket> findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(String email);
    List<Ticket> findByUserEmailAndStatus(String email, TicketStatus status);
    List<Ticket> findByEventEventCodeAndStatus(String eventCode, TicketStatus status);
    long countByEventEventCodeAndStatus(String eventCode, TicketStatus status);
    List<Ticket> findByEventEventDateAfterOrderByEventEventDateAsc(java.time.LocalDate fromDate);
}
