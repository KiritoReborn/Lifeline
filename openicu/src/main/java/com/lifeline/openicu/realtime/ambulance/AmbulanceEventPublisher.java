package com.lifeline.openicu.realtime.ambulance;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Publishes ambulance-related events to WebSocket topics.
 * Topics: /topic/ambulance, /topic/reservations
 */
@Component
public class AmbulanceEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public AmbulanceEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Broadcast when ambulance is assigned to a hospital.
     */
    public void publishAmbulanceAssigned(String ambulanceId, Long hospitalId, String hospitalName,
            Long bedId, String bedType, double distanceKm) {
        Map<String, Object> payload = Map.of(
                "event", "AMBULANCE_ASSIGNED",
                "ambulanceId", ambulanceId,
                "hospitalId", hospitalId,
                "hospitalName", hospitalName,
                "bedId", bedId,
                "bedType", bedType,
                "distanceKm", distanceKm,
                "timestamp", LocalDateTime.now().toString());
        messagingTemplate.convertAndSend("/topic/ambulance", payload);
    }

    /**
     * Broadcast when a bed is reserved for an ambulance.
     */
    public void publishBedReserved(UUID reservationId, String ambulanceId, Long hospitalId,
            Long bedId, LocalDateTime expiresAt) {
        Map<String, Object> payload = Map.of(
                "event", "BED_RESERVED",
                "reservationId", reservationId.toString(),
                "ambulanceId", ambulanceId,
                "hospitalId", hospitalId,
                "bedId", bedId,
                "expiresAt", expiresAt.toString());
        messagingTemplate.convertAndSend("/topic/reservations", payload);
    }

    /**
     * Broadcast when a reservation expires (lazy expiry detected).
     */
    public void publishReservationExpired(UUID reservationId, String ambulanceId,
            Long hospitalId, Long bedId) {
        Map<String, Object> payload = Map.of(
                "event", "RESERVATION_EXPIRED",
                "reservationId", reservationId.toString(),
                "ambulanceId", ambulanceId,
                "hospitalId", hospitalId,
                "bedId", bedId,
                "timestamp", LocalDateTime.now().toString());
        messagingTemplate.convertAndSend("/topic/reservations", payload);
    }
}
