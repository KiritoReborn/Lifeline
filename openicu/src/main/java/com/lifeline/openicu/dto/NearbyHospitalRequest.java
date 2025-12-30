package com.lifeline.openicu.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NearbyHospitalRequest {
    
    @NotNull(message = "Latitude is required")
    @Min(value = -90, message = "Latitude must be between -90 and 90")
    @Max(value = 90, message = "Latitude must be between -90 and 90")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    @Min(value = -180, message = "Longitude must be between -180 and 180")
    @Max(value = 180, message = "Longitude must be between -180 and 180")
    private Double longitude;
    
    @NotNull(message = "Radius is required")
    @Min(value = 0, message = "Radius must be between 0.1 and 500 kilometers")
    @Max(value = 500, message = "Radius must be between 0.1 and 500 kilometers")
    private Double radiusKm;
    
    @Min(value = 0, message = "Minimum beds must be non-negative")
    private Integer minBeds;
    
    private String category;
    
    private String emergencyService;
}
