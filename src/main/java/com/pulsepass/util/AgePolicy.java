package com.pulsepass.util;

import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;

public final class AgePolicy {
    public static final int MINIMUM_AGE = 16;
    private static final ZoneId ZONE_ID = ZoneId.of("America/Bogota");

    private AgePolicy() {}

    public static LocalDate today() {
        return LocalDate.now(ZONE_ID);
    }

    public static boolean meetsMinimumAge(LocalDate birthDate) {
        return birthDate != null
                && !birthDate.isAfter(today())
                && Period.between(birthDate, today()).getYears() >= MINIMUM_AGE;
    }
}
