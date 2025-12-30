package com.lifeline.openicu.exception;

/**
 * Exception thrown when search criteria parameters are invalid.
 * This includes invalid sort fields, page sizes, or other search parameters.
 */
public class InvalidSearchCriteriaException extends RuntimeException {
    
    public InvalidSearchCriteriaException(String message) {
        super(message);
    }
    
    public InvalidSearchCriteriaException(String message, Throwable cause) {
        super(message, cause);
    }
}
