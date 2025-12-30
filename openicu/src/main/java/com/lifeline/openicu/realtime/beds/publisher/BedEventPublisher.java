package com.lifeline.openicu.realtime.beds.publisher;

import com.lifeline.openicu.realtime.beds.dto.BedStatusEvent;
import com.lifeline.openicu.realtime.beds.dto.ICUAvailabilityEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Pure event publisher for Backend-2 real-time bed updates.
 * Publishes pre-prepared event payloads to WebSocket topics.
 */
@Component
public class BedEventPublisher {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public BedEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    /**
     * Publishes bed status change event to /topic/beds.
     * 
     * @param event pre-prepared bed status event payload
     */
    public void publishBedStatusChange(BedStatusEvent event) {
        messagingTemplate.convertAndSend("/topic/beds", event);
    }
    
    /**
     * Publishes ICU availability count update to /topic/icu.
     * 
     * @param event pre-prepared ICU availability event payload
     */
    public void publishICUAvailabilityUpdate(ICUAvailabilityEvent event) {
        messagingTemplate.convertAndSend("/topic/icu", event);
    }
}