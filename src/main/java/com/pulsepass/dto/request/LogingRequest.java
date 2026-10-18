package com.pulsepass.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LogingRequest(

        @NotBlank String identifier,

        @NotBlank String password

) {}

