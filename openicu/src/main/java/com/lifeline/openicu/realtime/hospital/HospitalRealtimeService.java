package com.lifeline.openicu.realtime.hospital;

import com.lifeline.openicu.entity.Hospital;
import com.lifeline.openicu.realtime.hospital.dto.HospitalBroadcastMessage;
import com.lifeline.openicu.repository.HospitalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for broadcasting hospital data changes via WebSocket.
 * Transforms hospital entities into broadcast messages and sends them to subscribed clients.
 */
@Service
public class HospitalRealtimeService {
    
    private static final Logger logger = LoggerFactory.getLogger(HospitalRealtimeService.class);
    private static final String HOSPITAL_TOPIC = "/topic/hospitals";
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    private final SimpMessagingTemplate messagingTemplate;
    private final HospitalRepository hospitalRepository;
    
    public HospitalRealtimeService(SimpMessagingTemplate messagingTemplate, 
                                   HospitalRepository hospitalRepository) {
        this.messagingTemplate = messagingTemplate;
        this.hospitalRepository = hospitalRepository;
    }
    
    /**
     * Broadcast a hospital event to all subscribed clients.
     * 
     * @param hospital The hospital entity to broadcast
     * @param eventType The event type ("HOSPITAL_CREATED" or "HOSPITAL_UPDATED")
     */
    public void broadcastHospitalEvent(Hospital hospital, String eventType) {
        try {
            HospitalBroadcastMessage message = createBroadcastMessage(hospital, eventType);
            messagingTemplate.convertAndSend(HOSPITAL_TOPIC, message);
            logger.debug("Broadcast {} event for hospital ID: {}", eventType, hospital.getId());
        } catch (Exception e) {
            logger.error("Failed to broadcast hospital event for ID: {}", hospital.getId(), e);
        }
    }
    
    /**
     * Send all hospitals to a specific client session.
     * Used when a client first connects and requests the full hospital list.
     * 
     * @param sessionId The WebSocket session ID of the requesting client
     */
    public void sendAllHospitalsToClient(String sessionId) {
        try {
            List<Hospital> hospitals = hospitalRepository.findAll();
            logger.info("Sending {} hospitals to client session: {}", hospitals.size(), sessionId);
            
            for (Hospital hospital : hospitals) {
                HospitalBroadcastMessage message = createBroadcastMessage(hospital, "HOSPITAL_LIST");
                messagingTemplate.convertAndSendToUser(
                    sessionId, 
                    HOSPITAL_TOPIC, 
                    message
                );
            }
        } catch (Exception e) {
            logger.error("Failed to send hospital list to session: {}", sessionId, e);
        }
    }
    
    /**
     * Create a broadcast message from a hospital entity.
     * Handles null values gracefully for optional fields.
     * 
     * @param hospital The hospital entity
     * @param eventType The event type
     * @return The broadcast message DTO
     */
    private HospitalBroadcastMessage createBroadcastMessage(Hospital hospital, String eventType) {
        String timestamp = LocalDateTime.now().format(ISO_FORMATTER);
        
        return new HospitalBroadcastMessage(
            eventType,
            hospital.getId(),
            hospital.getName(),
            hospital.getLatitude(),
            hospital.getLongitude(),
            hospital.getState(),
            hospital.getDistrict(),
            timestamp
        );
    }
}
