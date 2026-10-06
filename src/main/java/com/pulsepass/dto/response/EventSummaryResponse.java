package com.pulsepass.dto.response;

import com.pulsepass.enums.EventCategory;
import com.pulsepass.enums.EventStatus;

import java.time.LocalDate;

public record EventSummaryResponse(
        Long id,
        String eventCode,
        String name,
        EventCategory category,
        EventStatus status,
        LocalDate eventDate
) {
}
