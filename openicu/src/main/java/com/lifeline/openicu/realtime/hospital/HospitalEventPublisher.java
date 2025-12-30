package com.lifeline.openicu.realtime.hospital;

import com.lifeline.openicu.entity.Hospital;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Publisher for hospital events.
 * Bridges the Hospital Service and Realtime Service to broadcast hospital changes.
 */
@Component
public class HospitalEventPublisher {
    
    private static final Logger logger = LoggerFactory.getLogger(HospitalEventPublisher.class);
    private static final String EVENT_CREATED = "HOSPITAL_CREATED";
    private static final String EVENT_UPDATED = "HOSPITAL_UPDATED";
    
    private final HospitalRealtimeService realtimeService;
    
    public HospitalEventPublisher(HospitalRealtimeService realtimeService) {
        this.realtimeService = realtimeService;
    }
    
    /**
     * Publish a hospital created event.
     * Broadcasts the new hospital to all subscribed WebSocket clients.
     * 
     * @param hospital The newly created hospital
     */
    public void publishHospitalCreated(Hospital hospital) {
        try {
            logger.info("Publishing HOSPITAL_CREATED event for hospital ID: {}", hospital.getId());
            realtimeService.broadcastHospitalEvent(hospital, EVENT_CREATED);
        } catch (Exception e) {
            logger.error("Failed to publish HOSPITAL_CREATED event for hospital ID: {}", 
                        hospital.getId(), e);
            // Don't propagate exception - WebSocket errors shouldn't break REST API
        }
    }
    
    /**
     * Publish a hospital updated event.
     * Broadcasts the updated hospital to all subscribed WebSocket clients.
     * 
     * @param hospital The updated hospital
     */
    public void publishHospitalUpdated(Hospital hospital) {
        try {
            logger.info("Publishing HOSPITAL_UPDATED event for hospital ID: {}", hospital.getId());
            realtimeService.broadcastHospitalEvent(hospital, EVENT_UPDATED);
        } catch (Exception e) {
            logger.error("Failed to publish HOSPITAL_UPDATED event for hospital ID: {}", 
                        hospital.getId(), e);
            // Don't propagate exception - WebSocket errors shouldn't break REST API
        }
    }
}
