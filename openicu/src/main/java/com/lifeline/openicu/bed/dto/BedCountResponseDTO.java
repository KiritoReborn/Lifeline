package com.lifeline.openicu.bed.dto;

public class BedCountResponseDTO {
    
    private int count;
    
    // Default constructor
    public BedCountResponseDTO() {}
    
    // Constructor
    public BedCountResponseDTO(int count) {
        this.count = count;
    }
    
    // Getters and Setters
    public int getCount() {
        return count;
    }
    
    public void setCount(int count) {
        this.count = count;
    }
}