package com.pulsepass.dto.request;

import com.pulsepass.enums.EventCategory;

import java.time.LocalDate;

public record CreateEventRequest(
        String eventCode,
        String name,
        String description,
        EventCategory category,
        LocalDate eventDate,
        Integer minimumAge,
        String streamingUrl,
        String venueCode
) {
}
