package com.lifeline.openicu.ambulance.repository;

import com.lifeline.openicu.ambulance.entity.BedReservation;
import com.lifeline.openicu.ambulance.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BedReservationRepository extends JpaRepository<BedReservation, UUID> {

    /**
     * Find active reservation by ambulance ID
     */
    Optional<BedReservation> findByAmbulanceIdAndStatus(String ambulanceId, ReservationStatus status);

    /**
     * Find active reservation by bed ID
     */
    Optional<BedReservation> findByBedIdAndStatus(Long bedId, ReservationStatus status);

    /**
     * Find expired reservations (status = RESERVED and expiryTime < now)
     */
    List<BedReservation> findByStatusAndExpiryTimeBefore(ReservationStatus status, LocalDateTime time);
}
