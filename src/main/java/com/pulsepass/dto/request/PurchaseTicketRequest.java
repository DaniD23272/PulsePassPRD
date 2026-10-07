package com.pulsepass.dto.request;

import com.pulsepass.enums.TicketType;

public record PurchaseTicketRequest(
        String userEmail,
        String eventCode,
        TicketType type
) {}
