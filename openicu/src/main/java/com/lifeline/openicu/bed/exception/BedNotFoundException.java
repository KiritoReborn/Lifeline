package com.lifeline.openicu.bed.exception;

public class BedNotFoundException extends RuntimeException {
    
    public BedNotFoundException(String message) {
        super(message);
    }
    
    public BedNotFoundException(Long bedId) {
        super("Bed not found with id: " + bedId);
    }
}