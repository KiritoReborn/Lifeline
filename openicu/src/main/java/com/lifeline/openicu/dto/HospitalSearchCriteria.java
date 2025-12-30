package com.lifeline.openicu.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalSearchCriteria {
    
    private String keyword;
    
    private String state;
    
    private String district;
    
    private String category;
    
    private String careType;
    
    @Min(value = 0, message = "Minimum beds must be non-negative")
    private Integer minBeds;
    
    private String emergencyService;
    
    private String specialty;
    
    private String facility;
}
