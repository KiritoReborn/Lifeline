package com.lifeline.openicu.ambulance.dto;

public class HospitalMatchDTO {

    private Long hospitalId;
    private String hospitalName;
    private double distanceInKm;
    private int availableBeds;
    private Long bedId;

    // Default constructor
    public HospitalMatchDTO() {
    }

    // All-args constructor
    public HospitalMatchDTO(Long hospitalId, String hospitalName, double distanceInKm, int availableBeds, Long bedId) {
        this.hospitalId = hospitalId;
        this.hospitalName = hospitalName;
        this.distanceInKm = distanceInKm;
        this.availableBeds = availableBeds;
        this.bedId = bedId;
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
}
