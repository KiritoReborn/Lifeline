package com.lifeline.openicu.ambulance.service;

import com.lifeline.openicu.ambulance.dto.AmbulanceRequestDTO;
import com.lifeline.openicu.ambulance.dto.HospitalMatchDTO;
import com.lifeline.openicu.ambulance.entity.BedReservation;
import com.lifeline.openicu.ambulance.entity.ReservationStatus;
import com.lifeline.openicu.ambulance.repository.BedReservationRepository;
import com.lifeline.openicu.bed.entity.Bed;
import com.lifeline.openicu.bed.entity.BedStatus;
import com.lifeline.openicu.bed.entity.BedType;
import com.lifeline.openicu.bed.repository.BedRepository;
import com.lifeline.openicu.entity.Hospital;
import com.lifeline.openicu.realtime.ambulance.AmbulanceRealtimeService;
import com.lifeline.openicu.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AmbulanceRoutingService {

    private final HospitalRepository hospitalRepository;
    private final BedRepository bedRepository;
    private final BedReservationRepository bedReservationRepository;
    private final AmbulanceRealtimeService realtimeService;

    public AmbulanceRoutingService(HospitalRepository hospitalRepository,
            BedRepository bedRepository,
            BedReservationRepository bedReservationRepository,
            AmbulanceRealtimeService realtimeService) {
        this.hospitalRepository = hospitalRepository;
        this.bedRepository = bedRepository;
        this.bedReservationRepository = bedReservationRepository;
        this.realtimeService = realtimeService;
    }

    /**
     * Find the nearest hospital with an available bed matching the required type.
     * Creates a 15-minute reservation for the bed.
     * Emits WebSocket events for real-time dashboard updates.
     * 
     * OPTIMIZED: Uses radius-limited query instead of loading all hospitals.
     */
    @Transactional
    public HospitalMatchDTO findNearestHospital(AmbulanceRequestDTO request) {
        // Lazy expiry: expire stale reservations on every public call
        expireStaleReservations();

        // Parse the requested bed type
        BedType requestedBedType;
        try {
            requestedBedType = BedType.valueOf(request.getRequiredBedType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid bed type: " + request.getRequiredBedType() + ". Allowed values: ICU, VENTILATOR");
        }

        // OPTIMIZATION: Get only nearby hospitals with coordinates (within 50km
        // initially)
        // This uses a database-level Haversine query instead of loading all 30K
        // hospitals
        double searchRadiusKm = 50.0;
        List<Object[]> nearbyResults = hospitalRepository.findNearbyHospitals(
                request.getLatitude(), request.getLongitude(), searchRadiusKm);

        // If no hospitals within 50km, expand search to 200km
        if (nearbyResults.isEmpty()) {
            searchRadiusKm = 200.0;
            nearbyResults = hospitalRepository.findNearbyHospitals(
                    request.getLatitude(), request.getLongitude(), searchRadiusKm);
        }

        // Still no results? Try getting any hospital with coordinates
        if (nearbyResults.isEmpty()) {
            throw new IllegalStateException("No hospitals with coordinates found");
        }

        // Process only the nearby candidates (much smaller set!)
        for (Object[] row : nearbyResults) {
            // Extract hospital ID and distance from native query result
            Long hospitalId = ((Number) row[0]).longValue();
            // Distance is in the last column of the result
            double distance = ((Number) row[row.length - 1]).doubleValue();

            // Find available beds of the requested type at this hospital
            List<Bed> availableBeds = bedRepository.findByHospitalIdAndBedTypeAndBedStatus(
                    hospitalId, requestedBedType, BedStatus.AVAILABLE);

            // Filter out beds that already have an active reservation
            Bed availableBed = null;
            for (Bed bed : availableBeds) {
                Optional<BedReservation> activeReservation = bedReservationRepository
                        .findByBedIdAndStatus(bed.getId(), ReservationStatus.RESERVED);
                if (activeReservation.isEmpty()) {
                    availableBed = bed;
                    break; // Found one, no need to check more
                }
            }

            // Skip if no truly available beds
            if (availableBed == null) {
                continue;
            }

            // Found a hospital with an available bed! Get the full hospital entity
            Hospital hospital = hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new IllegalStateException("Hospital not found: " + hospitalId));

            // Create and save the reservation
            BedReservation reservation = new BedReservation(
                    hospital.getId(),
                    availableBed.getId(),
                    request.getAmbulanceId());
            bedReservationRepository.save(reservation);

            // Build result DTO
            HospitalMatchDTO result = new HospitalMatchDTO(
                    hospital.getId(),
                    hospital.getName(),
                    distance,
                    availableBeds.size(),
                    availableBed.getId());

            // === PHASE 2: Emit WebSocket events ===
            realtimeService.emitAmbulanceAssigned(request.getAmbulanceId(), result, requestedBedType.name());
            realtimeService.emitBedReserved(reservation);

            return result;
        }

        throw new IllegalStateException(
                "No hospital with available " + requestedBedType + " beds found within " + searchRadiusKm + "km");
    }

    /**
     * Lazy expiry: Find all RESERVED reservations that have expired and mark them
     * as EXPIRED.
     * Called at the start of every public service method.
     * Emits WebSocket events for each expired reservation.
     */
    private void expireStaleReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<BedReservation> expiredReservations = bedReservationRepository
                .findByStatusAndExpiryTimeBefore(ReservationStatus.RESERVED, now);

        for (BedReservation reservation : expiredReservations) {
            reservation.setStatus(ReservationStatus.EXPIRED);

            // === PHASE 2: Emit expiry event ===
            realtimeService.emitReservationExpired(reservation);
        }

        if (!expiredReservations.isEmpty()) {
            bedReservationRepository.saveAll(expiredReservations);
        }
    }
}
