package com.lifeline.openicu.bed.dto;

import com.lifeline.openicu.bed.entity.BedType;

public class BedCreateDTO {
    
    private Long hospitalId;
    private String bedNumber;
    private BedType bedType;
    
    // Default constructor
    public BedCreateDTO() {}
    
    // Constructor
    public BedCreateDTO(Long hospitalId, String bedNumber, BedType bedType) {
        this.hospitalId = hospitalId;
        this.bedNumber = bedNumber;
        this.bedType = bedType;
    }
    
    // Getters and Setters
    public Long getHospitalId() {
        return hospitalId;
    }
    
    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }
    
    public String getBedNumber() {
        return bedNumber;
    }
    
    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }
    
    public BedType getBedType() {
        return bedType;
    }
    
    public void setBedType(BedType bedType) {
        this.bedType = bedType;
    }
}