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
import com.lifeline.openicu.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class AmbulanceRoutingService {

    private final HospitalRepository hospitalRepository;
    private final BedRepository bedRepository;
    private final BedReservationRepository bedReservationRepository;

    public AmbulanceRoutingService(HospitalRepository hospitalRepository,
            BedRepository bedRepository,
            BedReservationRepository bedReservationRepository) {
        this.hospitalRepository = hospitalRepository;
        this.bedRepository = bedRepository;
        this.bedReservationRepository = bedReservationRepository;
    }

    /**
     * Find the nearest hospital with an available bed matching the required type.
     * Creates a 15-minute reservation for the bed.
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

        // Get all hospitals
        List<Hospital> hospitals = hospitalRepository.findAll();

        // Build a list of candidates: hospitals with available beds
        List<HospitalCandidate> candidates = new ArrayList<>();

        for (Hospital hospital : hospitals) {
            // Find available beds of the requested type at this hospital
            List<Bed> availableBeds = bedRepository.findByHospitalIdAndBedTypeAndBedStatus(
                    hospital.getId(), requestedBedType, BedStatus.AVAILABLE);

            // Filter out beds that already have an active reservation
            List<Bed> trulyAvailableBeds = new ArrayList<>();
            for (Bed bed : availableBeds) {
                Optional<BedReservation> activeReservation = bedReservationRepository
                        .findByBedIdAndStatus(bed.getId(), ReservationStatus.RESERVED);
                if (activeReservation.isEmpty()) {
                    trulyAvailableBeds.add(bed);
                }
            }

            // Skip hospital if no truly available beds
            if (trulyAvailableBeds.isEmpty()) {
                continue;
            }

            // Calculate distance - use fallback for hospitals without coordinates
            double distance;
            if (hospital.getLatitude() != null && hospital.getLongitude() != null) {
                // Normal distance calculation using Haversine formula
                distance = calculateDistance(
                        request.getLatitude(), request.getLongitude(),
                        hospital.getLatitude(), hospital.getLongitude());
            } else {
                // Fallback: assign high distance for hospitals without coordinates
                // This ensures they're considered but ranked lower than hospitals with coordinates
                distance = 9999.0; // High distance to prioritize hospitals with coordinates
            }

            candidates.add(new HospitalCandidate(hospital, trulyAvailableBeds, distance));
        }

        // Sort by distance ASC
        candidates.sort(Comparator.comparingDouble(HospitalCandidate::distance));

        // Pick the nearest hospital
        if (candidates.isEmpty()) {
            throw new IllegalStateException("No hospital with available " + requestedBedType + " beds found");
        }

        HospitalCandidate nearest = candidates.get(0);
        Bed bedToReserve = nearest.availableBeds().get(0);

        // Create and save the reservation
        BedReservation reservation = new BedReservation(
                nearest.hospital().getId(),
                bedToReserve.getId(),
                request.getAmbulanceId());
        bedReservationRepository.save(reservation);

        // Return the result
        return new HospitalMatchDTO(
                nearest.hospital().getId(),
                nearest.hospital().getName(),
                nearest.distance(),
                nearest.availableBeds().size(),
                bedToReserve.getId());
    }

    /**
     * Lazy expiry: Find all RESERVED reservations that have expired and mark them
     * as EXPIRED.
     * Called at the start of every public service method.
     */
    private void expireStaleReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<BedReservation> expiredReservations = bedReservationRepository
                .findByStatusAndExpiryTimeBefore(ReservationStatus.RESERVED, now);

        for (BedReservation reservation : expiredReservations) {
            reservation.setStatus(ReservationStatus.EXPIRED);
        }

        if (!expiredReservations.isEmpty()) {
            bedReservationRepository.saveAll(expiredReservations);
        }
    }

    /**
     * Calculate distance between two coordinates using the Haversine formula.
     * Returns distance in kilometers.
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double EARTH_RADIUS_KM = 6371.0;

        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLatRad = Math.toRadians(lat2 - lat1);
        double deltaLonRad = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                        * Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Internal record to hold hospital candidate data during sorting.
     */
    private record HospitalCandidate(Hospital hospital, List<Bed> availableBeds, double distance) {
    }
}
