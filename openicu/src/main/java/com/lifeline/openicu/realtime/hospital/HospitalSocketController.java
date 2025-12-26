package com.lifeline.openicu.realtime.hospital;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for hospital real-time messaging.
 * Handles client requests for hospital data via WebSocket.
 */
@Controller
public class HospitalSocketController {
    
    private static final Logger logger = LoggerFactory.getLogger(HospitalSocketController.class);
    
    private final HospitalRealtimeService realtimeService;
    
    public HospitalSocketController(HospitalRealtimeService realtimeService) {
        this.realtimeService = realtimeService;
    }
    
    /**
     * Handle client request for full hospital list.
     * Sends all hospitals to the requesting client's session.
     * 
     * @param headerAccessor Message header accessor to extract session ID
     */
    @MessageMapping("/hospitals/list")
    public void requestHospitalList(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        logger.info("Received hospital list request from session: {}", sessionId);
        
        realtimeService.sendAllHospitalsToClient(sessionId);
    }
}
