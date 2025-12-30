package com.lifeline.openicu.sos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sos_reports")
public class SOSReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String emergencyType;

    @Column(length = 1000)
    private String message;

    @Column(nullable = false)
    private LocalDateTime clientTimestamp;

    @Column(nullable = false)
    private LocalDateTime serverTimestamp;

    @Column(unique = true)
    private String offlineId;

    @Column(nullable = false)
    private String status; // PENDING, ACKNOWLEDGED, DISPATCHED, RESOLVED

    // Constructors
    public SOSReport() {
        this.serverTimestamp = LocalDateTime.now();
        this.status = "PENDING";
    }

    public SOSReport(Double latitude, Double longitude, String emergencyType, String message, Long clientTimestamp,
            String offlineId) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.emergencyType = emergencyType;
        this.message = message;
        this.clientTimestamp = LocalDateTime.ofInstant(
                java.time.Instant.ofEpochMilli(clientTimestamp),
                java.time.ZoneId.systemDefault());
        this.serverTimestamp = LocalDateTime.now();
        this.offlineId = offlineId;
        this.status = "PENDING";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getClientTimestamp() {
        return clientTimestamp;
    }

    public void setClientTimestamp(LocalDateTime clientTimestamp) {
        this.clientTimestamp = clientTimestamp;
    }

    public LocalDateTime getServerTimestamp() {
        return serverTimestamp;
    }

    public void setServerTimestamp(LocalDateTime serverTimestamp) {
        this.serverTimestamp = serverTimestamp;
    }

    public String getOfflineId() {
        return offlineId;
    }

    public void setOfflineId(String offlineId) {
        this.offlineId = offlineId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
