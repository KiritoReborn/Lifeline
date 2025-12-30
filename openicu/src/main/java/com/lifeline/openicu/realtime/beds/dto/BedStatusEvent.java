package com.lifeline.openicu.realtime.beds.dto;

import com.lifeline.openicu.bed.entity.BedType;
import com.lifeline.openicu.bed.entity.BedStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Immutable WebSocket event payload for bed status changes.
 * Published when bed status is updated (AVAILABLE/OCCUPIED/MAINTENANCE).
 */
@Getter
@AllArgsConstructor
public class BedStatusEvent {
    
    private final Long bedId;
    private final Long hospitalId;
    private final BedType bedType;
    private final BedStatus status;
    private final String timestamp;
}