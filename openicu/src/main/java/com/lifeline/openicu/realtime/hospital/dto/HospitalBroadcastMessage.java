package com.lifeline.openicu.realtime.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for WebSocket broadcast messages containing hospital data.
 * Sent to /topic/hospitals when hospitals are created or updated.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HospitalBroadcastMessage {
    
    /**
     * Event type: "HOSPITAL_CREATED" or "HOSPITAL_UPDATED"
     */
    private String event;
    
    /**
     * Unique hospital identifier
     */
    private Long hospitalId;
    
    /**
     * Hospital name
     */
    private String name;
    
    /**
     * Geographic latitude coordinate (-90 to 90)
     */
    private Double latitude;
    
    /**
     * Geographic longitude coordinate (-180 to 180)
     */
    private Double longitude;
    
    /**
     * State or administrative region
     */
    private String state;
    
    /**
     * District or sub-region
     */
    private String district;
    
    /**
     * ISO 8601 formatted timestamp of the event
     */
    private String timestamp;
}
