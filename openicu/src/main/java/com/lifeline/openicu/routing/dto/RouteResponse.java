package com.lifeline.openicu.routing.dto;

import java.util.List;

/**
 * Route response containing distance, time, and path coordinates.
 */
public class RouteResponse {

    private double distanceMeters;
    private long timeMillis;
    private List<double[]> coordinates; // [lat, lon] pairs
    private String encodedPolyline;

    public RouteResponse() {
    }

    public RouteResponse(double distanceMeters, long timeMillis, List<double[]> coordinates, String encodedPolyline) {
        this.distanceMeters = distanceMeters;
        this.timeMillis = timeMillis;
        this.coordinates = coordinates;
        this.encodedPolyline = encodedPolyline;
    }

    // Convenience methods
    public double getDistanceKm() {
        return distanceMeters / 1000.0;
    }

    public int getTimeMinutes() {
        return (int) (timeMillis / 60000);
    }

    // Getters and Setters
    public double getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(double distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    public long getTimeMillis() {
        return timeMillis;
    }

    public void setTimeMillis(long timeMillis) {
        this.timeMillis = timeMillis;
    }

    public List<double[]> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<double[]> coordinates) {
        this.coordinates = coordinates;
    }

    public String getEncodedPolyline() {
        return encodedPolyline;
    }

    public void setEncodedPolyline(String encodedPolyline) {
        this.encodedPolyline = encodedPolyline;
    }
}
