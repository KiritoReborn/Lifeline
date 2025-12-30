package com.lifeline.openicu.realtime.beds.service;

import com.lifeline.openicu.bed.entity.BedType;
import com.lifeline.openicu.bed.entity.BedStatus;
import com.lifeline.openicu.bed.repository.BedRepository;
import com.lifeline.openicu.realtime.beds.dto.BedStatusEvent;
import com.lifeline.openicu.realtime.beds.dto.ICUAvailabilityEvent;
import com.lifeline.openicu.realtime.beds.publisher.BedEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Orchestration service for Backend-2 real-time bed events.
 * Creates event payloads and delegates publishing to BedEventPublisher.
 */
@Service
public class BedRealtimeService {
    
    private final BedEventPublisher bedEventPublisher;
    private final BedRepository bedRepository;
    private final DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    public BedRealtimeService(BedEventPublisher bedEventPublisher, BedRepository bedRepository) {
        this.bedEventPublisher = bedEventPublisher;
        this.bedRepository = bedRepository;
    }
    
    /**
     * Handles bed status change events.
     * Creates BedStatusEvent and publishes to /topic/beds.
     * 
     * @param bedId the bed that changed status
     * @param hospitalId the hospital containing the bed
     * @param bedType the type of bed (ICU, VENTILATOR, GENERAL)
     * @param bedStatus the new status (AVAILABLE, OCCUPIED, MAINTENANCE)
     */
    public void onBedStatusChange(Long bedId, Long hospitalId, BedType bedType, BedStatus bedStatus) {
        String timestamp = LocalDateTime.now().format(isoFormatter);
        
        BedStatusEvent event = new BedStatusEvent(
            bedId,
            hospitalId,
            bedType,
            bedStatus,
            timestamp
        );
        
        bedEventPublisher.publishBedStatusChange(event);
    }
    
    /**
     * Handles ICU availability count changes.
     * Calculates current counts and publishes ICUAvailabilityEvent to /topic/icu.
     * 
     * @param hospitalId the hospital with updated availability counts
     */
    public void onICUAvailabilityChange(Long hospitalId) {
        // Calculate current ICU bed availability
        int availableICUBeds = bedRepository.countByHospitalIdAndBedTypeAndBedStatus(
            hospitalId, BedType.ICU, BedStatus.AVAILABLE
        );
        
        // Calculate current ventilator availability
        int availableVentilators = bedRepository.countByHospitalIdAndBedTypeAndBedStatus(
            hospitalId, BedType.VENTILATOR, BedStatus.AVAILABLE
        );
        
        String timestamp = LocalDateTime.now().format(isoFormatter);
        
        ICUAvailabilityEvent event = new ICUAvailabilityEvent(
            hospitalId,
            availableICUBeds,
            availableVentilators,
            timestamp
        );
        
        bedEventPublisher.publishICUAvailabilityUpdate(event);
    }
}