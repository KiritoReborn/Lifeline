package com.lifeline.openicu.sos.dto;

public class SOSReportDTO {
    private Double latitude;
    private Double longitude;
    private String emergencyType;
    private String message;
    private Long clientTimestamp;
    private String offlineId;

    // Getters and Setters
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

    public String getEmergencyType() {
        return emergencyType;
    }

    public void setEmergencyType(String emergencyType) {
        this.emergencyType = emergencyType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getClientTimestamp() {
        return clientTimestamp;
    }

    public void setClientTimestamp(Long clientTimestamp) {
        this.clientTimestamp = clientTimestamp;
    }

    public String getOfflineId() {
        return offlineId;
    }

    public void setOfflineId(String offlineId) {
        this.offlineId = offlineId;
    }
}
