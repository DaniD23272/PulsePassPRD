package com.pulsepass.dto.request;

import com.pulsepass.enums.EventCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreateEventRequest(
        @NotBlank String eventCode,
        @NotBlank String name,
        String description,
        @NotNull EventCategory category,
        @NotNull LocalDateTime eventDate,
        @NotNull @Min(0) Integer minimumAge,
        @NotBlank String venueCode
) {}
