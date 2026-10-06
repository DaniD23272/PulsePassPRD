package com.pulsepass.dto.request;

public record PurchaseTicketRequest(
        String eventCode,
        String ticketType
) {
}