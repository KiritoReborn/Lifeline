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
import com.lifeline.openicu.routing.dto.RouteResponse;
import com.lifeline.openicu.routing.service.RoutingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AmbulanceRoutingService {

    private final HospitalRepository hospitalRepository;
    private final BedRepository bedRepository;
    private final BedReservationRepository bedReservationRepository;
    private final AmbulanceRealtimeService realtimeService;
    private final RoutingService routingService;

    public AmbulanceRoutingService(HospitalRepository hospitalRepository,
            BedRepository bedRepository,
            BedReservationRepository bedReservationRepository,
            AmbulanceRealtimeService realtimeService,
            RoutingService routingService) {
        this.hospitalRepository = hospitalRepository;
        this.bedRepository = bedRepository;
        this.bedReservationRepository = bedReservationRepository;
        this.realtimeService = realtimeService;
        this.routingService = routingService;
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

        // OPTIMIZATION: Get only nearby hospitals with coordinates (within 100km
        // initially)
        // This uses a database-level Haversine query instead of loading all 30K
        // hospitals
        // OPTIMIZATION: Get only nearby hospitals via bounding box (Java-side distance
        // calc)
        // 100km is approx 0.9 degrees. Using 1.0 degree box.
        // Multi-pass search strategy:
        // Pass 1: Local (1.0 degree box ~ 100km)
        // Pass 2: Wide (6.0 degree box ~ 600km)

        double[] searchRadiiDegrees = { 1.0, 6.0, 180.0 };

        for (double boxSizeDegrees : searchRadiiDegrees) {
            System.out.println("DEBUG: Searching with box size " + boxSizeDegrees + " degrees");

            // OPTIMIZATION: Use JOIN to find hospitals that HAVE beds immediately
            List<Hospital> hospitalsInBox = hospitalRepository.findHospitalsInBoundingBoxWithAvailableBeds(
                    request.getLatitude() - boxSizeDegrees, request.getLatitude() + boxSizeDegrees,
                    request.getLongitude() - boxSizeDegrees, request.getLongitude() + boxSizeDegrees,
                    requestedBedType.name());

            System.out.println("DEBUG: Found " + hospitalsInBox.size() + " hospitals with AVAILABLE " + requestedBedType
                    + " beds in bounding box");

            // Calculate distance and sort in Java
            List<HospitalMatchDTO> candidates = hospitalsInBox.stream()
                    .map(h -> {
                        double dist = calculateHaversineDistance(request.getLatitude(), request.getLongitude(),
                                h.getLatitude(), h.getLongitude());
                        return new HospitalMatchDTO(h.getId(), h.getName(), dist, 0, 0L, 0, null, null);
                    })
                    .sorted((a, b) -> Double.compare(a.getDistanceInKm(), b.getDistanceInKm()))
                    .toList();

            // Process candidates (now we know they have beds!)
            for (HospitalMatchDTO candidate : candidates) {
                Long hospitalId = candidate.getHospitalId();

                // Fetch the actual bed to reserve (just need one)
                // We re-query here but only for the WINNING hospital, which is fast.
                List<Bed> availableBeds = bedRepository.findByHospitalIdAndBedTypeAndBedStatus(
                        hospitalId, requestedBedType, BedStatus.AVAILABLE);

                Bed availableBed = null;
                // Strict check again just to be safe and get specific bed ID
                for (Bed bed : availableBeds) {
                    List<BedReservation> activeReservations = bedReservationRepository
                            .findByBedIdAndStatus(bed.getId(), ReservationStatus.RESERVED);
                    if (activeReservations.isEmpty()) {
                        availableBed = bed;
                        break;
                    }
                }

                if (availableBed == null)
                    continue; // Should be rare given the query, but race conditions exist

                // If no bed, skip to next hospital
                // if (availableBed == null) {
                //     continue;
                // }

                // Found a match!
                Hospital hospital = hospitalRepository.findById(hospitalId)
                        .orElseThrow(() -> new IllegalStateException("Hospital not found: " + hospitalId));

                // Create reservation
                BedReservation reservation = new BedReservation(
                        hospital.getId(),
                        availableBed.getId(),
                        request.getAmbulanceId());
                bedReservationRepository.save(reservation);

                // Calculate route
                RouteResponse route = routingService.getRoute(
                        request.getLatitude(), request.getLongitude(),
                        hospital.getLatitude(), hospital.getLongitude());

                // Build result
                HospitalMatchDTO result = new HospitalMatchDTO(
                        hospital.getId(),
                        hospital.getName(),
                        route.getDistanceKm(),
                        availableBeds.size(),
                        availableBed.getId(),
                        route.getTimeMinutes(),
                        route.getEncodedPolyline(),
                        route.getCoordinates());

                // Emit events
                realtimeService.emitAmbulanceAssigned(request.getAmbulanceId(), result, requestedBedType.name());
                realtimeService.emitBedReserved(reservation);

                return result;
            }
            // If loop finishes, continue to next radius
        }

        // Import needed at top of file, but I can't add imports easily with
        // replace_file_content if start line is too far.
        // I will use fully qualified name to avoid import issues or multiple edit
        // chunks.
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND,
                "No hospital with available " + requestedBedType + " beds found within 600km");
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

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.sin(dLon / 2)
                        * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
