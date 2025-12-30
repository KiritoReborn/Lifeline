package com.lifeline.openicu.bed.dto;

import com.lifeline.openicu.bed.entity.Bed;
import com.lifeline.openicu.bed.entity.BedType;
import com.lifeline.openicu.bed.entity.BedStatus;

import java.time.LocalDateTime;

public class BedResponseDTO {
    
    private Long id;
    private String bedNumber;
    private Long hospitalId;
    private BedType bedType;
    private BedStatus bedStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public BedResponseDTO() {}
    
    // Constructor from Bed entity
    public BedResponseDTO(Bed bed) {
        this.id = bed.getId();
        this.bedNumber = bed.getBedNumber();
        this.hospitalId = bed.getHospitalId();
        this.bedType = bed.getBedType();
        this.bedStatus = bed.getBedStatus();
        this.createdAt = bed.getCreatedAt();
        this.updatedAt = bed.getUpdatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getBedNumber() {
        return bedNumber;
    }
    
    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }
    
    public Long getHospitalId() {
        return hospitalId;
    }
    
    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }
    
    public BedType getBedType() {
        return bedType;
    }
    
    public void setBedType(BedType bedType) {
        this.bedType = bedType;
    }
    
    public BedStatus getBedStatus() {
        return bedStatus;
    }
    
    public void setBedStatus(BedStatus bedStatus) {
        this.bedStatus = bedStatus;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}