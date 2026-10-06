package com.pulsepass.dto.response;

import com.pulsepass.enums.EventCategory;
import com.pulsepass.enums.EventStatus;

import java.time.LocalDate;

public record EventResponse(
        Long id,
        String eventCode,
        String name,
        String description,
        EventCategory category,
        EventStatus status,
        LocalDate eventDate,
        Integer minimumAge,
        String streamingUrl,
        VenueResponse venue
) {
}