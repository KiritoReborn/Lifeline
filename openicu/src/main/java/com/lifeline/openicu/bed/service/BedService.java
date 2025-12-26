package com.lifeline.openicu.bed.service;

import com.lifeline.openicu.bed.entity.Bed;
import com.lifeline.openicu.bed.entity.BedType;
import com.lifeline.openicu.bed.entity.BedStatus;
import com.lifeline.openicu.bed.exception.BedNotFoundException;
import com.lifeline.openicu.bed.repository.BedRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BedService {
    
    private final BedRepository bedRepository;
    
    public BedService(BedRepository bedRepository) {
        this.bedRepository = bedRepository;
    }
    
    public Bed createBed(Long hospitalId, String bedNumber, BedType bedType) {
        Bed bed = new Bed(bedNumber, hospitalId, bedType, BedStatus.AVAILABLE);
        return bedRepository.save(bed);
    }
    
    public Bed updateBedStatus(Long bedId, BedStatus newStatus) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new BedNotFoundException(bedId));
        
        bed.setBedStatus(newStatus);
        return bedRepository.save(bed);
    }
    
    public List<Bed> getAvailableBeds(Long hospitalId, BedType bedType) {
        return bedRepository.findByHospitalIdAndBedTypeAndBedStatus(hospitalId, bedType, BedStatus.AVAILABLE);
    }
    
    public int getAvailableBedCount(Long hospitalId, BedType bedType) {
        return bedRepository.countByHospitalIdAndBedTypeAndBedStatus(hospitalId, bedType, BedStatus.AVAILABLE);
    }
}