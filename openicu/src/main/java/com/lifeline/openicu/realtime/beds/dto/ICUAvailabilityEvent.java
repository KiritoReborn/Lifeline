package com.lifeline.openicu.realtime.beds.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Immutable WebSocket event payload for ICU availability count updates.
 * Published when ICU or ventilator bed counts change at a hospital.
 */
@Getter
@AllArgsConstructor
public class ICUAvailabilityEvent {
    
    private final Long hospitalId;
    private final int availableICUBeds;
    private final int availableVentilators;
    private final String timestamp;
}