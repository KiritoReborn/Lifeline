package com.lifeline.openicu.realtime.ambulance;

import com.lifeline.openicu.ambulance.dto.HospitalMatchDTO;
import com.lifeline.openicu.ambulance.entity.BedReservation;
import org.springframework.stereotype.Service;

/**
 * Converts entities/DTOs to WebSocket payloads and delegates to publisher.
 * Contains NO database logic - called from AmbulanceRoutingService.
 */
@Service
public class AmbulanceRealtimeService {

    private final AmbulanceEventPublisher publisher;

    public AmbulanceRealtimeService(AmbulanceEventPublisher publisher) {
        this.publisher = publisher;
    }

    /**
     * Emit event when ambulance is matched to a hospital.
     */
    public void emitAmbulanceAssigned(String ambulanceId, HospitalMatchDTO match, String bedType) {
        publisher.publishAmbulanceAssigned(
                ambulanceId,
                match.getHospitalId(),
                match.getHospitalName(),
                match.getBedId(),
                bedType,
                match.getDistanceInKm());
    }

    /**
     * Emit event when bed is reserved.
     */
    public void emitBedReserved(BedReservation reservation) {
        publisher.publishBedReserved(
                reservation.getId(),
                reservation.getAmbulanceId(),
                reservation.getHospitalId(),
                reservation.getBedId(),
                reservation.getExpiryTime());
    }

    /**
     * Emit event when reservation expires (lazy expiry).
     */
    public void emitReservationExpired(BedReservation reservation) {
        publisher.publishReservationExpired(
                reservation.getId(),
                reservation.getAmbulanceId(),
                reservation.getHospitalId(),
                reservation.getBedId());
    }
}
