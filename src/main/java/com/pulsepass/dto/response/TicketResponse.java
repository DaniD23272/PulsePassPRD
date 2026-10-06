package com.pulsepass.dto.response;

import com.pulsepass.enums.TicketStatus;
import com.pulsepass.enums.TicketType;

import java.math.BigDecimal;

public record TicketResponse(
        Long id,
        String ticketCode,
        TicketType type,
        BigDecimal price,
        TicketStatus status,
        String eventCode,
        String username
) {
}