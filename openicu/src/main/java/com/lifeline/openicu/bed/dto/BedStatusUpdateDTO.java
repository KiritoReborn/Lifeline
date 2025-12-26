package com.lifeline.openicu.bed.dto;

import com.lifeline.openicu.bed.entity.BedStatus;

public class BedStatusUpdateDTO {
    
    private BedStatus bedStatus;
    
    // Default constructor
    public BedStatusUpdateDTO() {}
    
    // Constructor
    public BedStatusUpdateDTO(BedStatus bedStatus) {
        this.bedStatus = bedStatus;
    }
    
    // Getters and Setters
    public BedStatus getBedStatus() {
        return bedStatus;
    }
    
    public void setBedStatus(BedStatus bedStatus) {
        this.bedStatus = bedStatus;
    }
}