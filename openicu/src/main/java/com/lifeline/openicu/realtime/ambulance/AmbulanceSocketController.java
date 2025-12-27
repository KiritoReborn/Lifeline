package com.lifeline.openicu.realtime.ambulance;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.util.Map;

/**
 * WebSocket controller for ambulance operations.
 * Handles client subscriptions and optional message mappings.
 * Contains NO business logic.
 */
@Controller
public class AmbulanceSocketController {

    /**
     * Handle subscription to /topic/ambulance.
     * Returns confirmation message on subscribe.
     */
    @SubscribeMapping("/ambulance")
    public Map<String, String> handleAmbulanceSubscription() {
        return Map.of(
                "status", "SUBSCRIBED",
                "topic", "/topic/ambulance",
                "message", "Connected to ambulance updates");
    }

    /**
     * Handle subscription to /topic/reservations.
     * Returns confirmation message on subscribe.
     */
    @SubscribeMapping("/reservations")
    public Map<String, String> handleReservationsSubscription() {
        return Map.of(
                "status", "SUBSCRIBED",
                "topic", "/topic/reservations",
                "message", "Connected to reservation updates");
    }

    /**
     * Optional: Handle status ping from client.
     * Client sends to /app/ambulance/status, response goes to /topic/ambulance.
     */
    @MessageMapping("/ambulance/status")
    @SendTo("/topic/ambulance")
    public Map<String, String> handleStatusPing() {
        return Map.of(
                "event", "STATUS_PING",
                "status", "ACTIVE",
                "message", "Ambulance WebSocket channel is active");
    }
}
