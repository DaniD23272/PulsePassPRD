package com.pulsepass.dto.response;

import com.pulsepass.enums.TicketStatus;
import com.pulsepass.enums.TicketType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TicketResponse(
        Long id,
        String ticketCode,
        TicketType type,
        BigDecimal price,
        TicketStatus status,
        LocalDate purchaseDate,
        String userEmail,
        String eventCode,
        String eventName
) {}
