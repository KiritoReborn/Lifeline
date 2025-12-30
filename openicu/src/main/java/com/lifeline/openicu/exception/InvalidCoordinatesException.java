package com.lifeline.openicu.exception;

/**
 * Exception thrown when geographic coordinates or radius values are invalid.
 * This includes out-of-range latitude/longitude values or invalid radius values.
 */
public class InvalidCoordinatesException extends RuntimeException {
    
    public InvalidCoordinatesException(String message) {
        super(message);
    }
    
    public InvalidCoordinatesException(String message, Throwable cause) {
        super(message, cause);
    }
}
