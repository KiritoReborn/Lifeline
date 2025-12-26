package com.lifeline.openicu.ambulance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AmbulanceRequestDTO {

    @NotBlank(message = "Ambulance ID is required")
    private String ambulanceId;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotBlank(message = "Required bed type is required")
    private String requiredBedType; // ICU or VENTILATOR

    // Default constructor
    public AmbulanceRequestDTO() {
    }

    // All-args constructor
    public AmbulanceRequestDTO(String ambulanceId, Double latitude, Double longitude, String requiredBedType) {
        this.ambulanceId = ambulanceId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.requiredBedType = requiredBedType;
    }

    // Getters and Setters
    public String getAmbulanceId() {
        return ambulanceId;
    }

    public void setAmbulanceId(String ambulanceId) {
        this.ambulanceId = ambulanceId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getRequiredBedType() {
        return requiredBedType;
    }

    public void setRequiredBedType(String requiredBedType) {
        this.requiredBedType = requiredBedType;
    }
}
