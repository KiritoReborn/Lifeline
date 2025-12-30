package com.lifeline.openicu.ambulance.dto;

import java.util.List;

public class HospitalMatchDTO {

    private Long hospitalId;
    private String hospitalName;
    private double distanceInKm;
    private int availableBeds;
    private Long bedId;

    // Route information (from GraphHopper)
    private int etaMinutes;
    private String encodedPolyline;
    private List<double[]> routeCoordinates;

    // Default constructor
    public HospitalMatchDTO() {
    }

    // Basic constructor (backward compatible)
    public HospitalMatchDTO(Long hospitalId, String hospitalName, double distanceInKm, int availableBeds, Long bedId) {
        this.hospitalId = hospitalId;
        this.hospitalName = hospitalName;
        this.distanceInKm = distanceInKm;
        this.availableBeds = availableBeds;
        this.bedId = bedId;
    }

    // Full constructor with route info
    public HospitalMatchDTO(Long hospitalId, String hospitalName, double distanceInKm, int availableBeds,
            Long bedId, int etaMinutes, String encodedPolyline, List<double[]> routeCoordinates) {
        this.hospitalId = hospitalId;
        this.hospitalName = hospitalName;
        this.distanceInKm = distanceInKm;
        this.availableBeds = availableBeds;
        this.bedId = bedId;
        this.etaMinutes = etaMinutes;
        this.encodedPolyline = encodedPolyline;
        this.routeCoordinates = routeCoordinates;
    }

    // Getters and Setters
    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public double getDistanceInKm() {
        return distanceInKm;
    }

    public void setDistanceInKm(double distanceInKm) {
        this.distanceInKm = distanceInKm;
    }

    public int getAvailableBeds() {
        return availableBeds;
    }

    public void setAvailableBeds(int availableBeds) {
        this.availableBeds = availableBeds;
    }

    public Long getBedId() {
        return bedId;
    }

    public void setBedId(Long bedId) {
        this.bedId = bedId;
    }

    public int getEtaMinutes() {
        return etaMinutes;
    }

    public void setEtaMinutes(int etaMinutes) {
        this.etaMinutes = etaMinutes;
    }

    public String getEncodedPolyline() {
        return encodedPolyline;
    }

    public void setEncodedPolyline(String encodedPolyline) {
        this.encodedPolyline = encodedPolyline;
    }

    public List<double[]> getRouteCoordinates() {
        return routeCoordinates;
    }

    public void setRouteCoordinates(List<double[]> routeCoordinates) {
        this.routeCoordinates = routeCoordinates;
    }
}
