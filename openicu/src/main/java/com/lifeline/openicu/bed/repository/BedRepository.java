package com.lifeline.openicu.bed.repository;

import com.lifeline.openicu.bed.entity.Bed;
import com.lifeline.openicu.bed.entity.BedType;
import com.lifeline.openicu.bed.entity.BedStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    
    List<Bed> findByHospitalIdAndBedTypeAndBedStatus(Long hospitalId, BedType bedType, BedStatus bedStatus);
    
    int countByHospitalIdAndBedTypeAndBedStatus(Long hospitalId, BedType bedType, BedStatus bedStatus);
}