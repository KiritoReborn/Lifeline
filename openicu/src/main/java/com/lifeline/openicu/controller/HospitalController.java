package com.lifeline.openicu.controller;

import com.lifeline.openicu.dto.HospitalCreateDTO;
import com.lifeline.openicu.dto.HospitalResponseDTO;
import com.lifeline.openicu.dto.HospitalSearchCriteria;
import com.lifeline.openicu.dto.NearbyHospitalRequest;
import com.lifeline.openicu.dto.NearbyHospitalResponse;
import com.lifeline.openicu.exception.InvalidCoordinatesException;
import com.lifeline.openicu.exception.InvalidSearchCriteriaException;
import com.lifeline.openicu.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/hospitals")
@Validated
public class HospitalController {

    private final HospitalService hospitalService;
    
    private static final Set<String> VALID_SORT_FIELDS = Set.of(
        "name", "state", "district", "totalNumBeds", "createdAt", "updatedAt"
    );
    
    private static final int MIN_PAGE_SIZE = 1;
    private static final int MAX_PAGE_SIZE = 100;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @PostMapping
    public ResponseEntity<HospitalResponseDTO> createHospital(
            @Valid @RequestBody HospitalCreateDTO createDTO) {
        HospitalResponseDTO response = hospitalService.createHospital(createDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<HospitalResponseDTO>> getAllHospitals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        
        // Validate page size
        if (size < MIN_PAGE_SIZE || size > MAX_PAGE_SIZE) {
            throw new InvalidSearchCriteriaException(
                String.format("Page size must be between %d and %d", MIN_PAGE_SIZE, MAX_PAGE_SIZE)
            );
        }
        
        // Validate sort field
        if (!VALID_SORT_FIELDS.contains(sortBy)) {
            throw new InvalidSearchCriteriaException(
                String.format("Invalid sort field '%s'. Valid fields are: %s", 
                    sortBy, String.join(", ", VALID_SORT_FIELDS))
            );
        }
        
        // Create sort direction
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDir);
        } catch (IllegalArgumentException e) {
            throw new InvalidSearchCriteriaException(
                String.format("Invalid sort direction '%s'. Valid values are: ASC, DESC", sortDir)
            );
        }
        
        // Create pageable with sorting
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<HospitalResponseDTO> hospitals = hospitalService.getAllHospitals(pageable);
        return ResponseEntity.ok(hospitals);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<HospitalResponseDTO>> searchHospitals(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String careType,
            @RequestParam(required = false) Integer minBeds,
            @RequestParam(required = false) String emergencyService,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String facility,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        
        // Validate page size
        if (size < MIN_PAGE_SIZE || size > MAX_PAGE_SIZE) {
            throw new InvalidSearchCriteriaException(
                String.format("Page size must be between %d and %d", MIN_PAGE_SIZE, MAX_PAGE_SIZE)
            );
        }
        
        // Validate sort field
        if (!VALID_SORT_FIELDS.contains(sortBy)) {
            throw new InvalidSearchCriteriaException(
                String.format("Invalid sort field '%s'. Valid fields are: %s", 
                    sortBy, String.join(", ", VALID_SORT_FIELDS))
            );
        }
        
        // Create sort direction
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDir);
        } catch (IllegalArgumentException e) {
            throw new InvalidSearchCriteriaException(
                String.format("Invalid sort direction '%s'. Valid values are: ASC, DESC", sortDir)
            );
        }
        
        // Build search criteria from parameters
        HospitalSearchCriteria criteria = new HospitalSearchCriteria();
        criteria.setKeyword(keyword);
        criteria.setState(state);
        criteria.setDistrict(district);
        criteria.setCategory(category);
        criteria.setCareType(careType);
        criteria.setMinBeds(minBeds);
        criteria.setEmergencyService(emergencyService);
        criteria.setSpecialty(specialty);
        criteria.setFacility(facility);
        
        // Create pageable with sorting
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        // Delegate to service layer
        Page<HospitalResponseDTO> results = hospitalService.searchHospitals(criteria, pageable);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalResponseDTO> getHospitalById(@PathVariable Long id) {
        HospitalResponseDTO response = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HospitalResponseDTO> updateHospital(
            @PathVariable Long id,
            @Valid @RequestBody HospitalCreateDTO updateDTO) {
        HospitalResponseDTO response = hospitalService.updateHospital(id, updateDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getHospitalStats() {
        long totalHospitals = hospitalService.getTotalHospitals();
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalHospitals", totalHospitals);
        stats.put("message", "Hospital data loaded from CSV");
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping("/nearby")
    public ResponseEntity<Page<NearbyHospitalResponse>> findNearbyHospitals(
            @Valid @RequestBody NearbyHospitalRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        // Validate page size
        if (size < MIN_PAGE_SIZE || size > MAX_PAGE_SIZE) {
            throw new InvalidSearchCriteriaException(
                String.format("Page size must be between %d and %d", MIN_PAGE_SIZE, MAX_PAGE_SIZE)
            );
        }
        
        // Validate coordinates (additional validation beyond @Valid)
        Double latitude = request.getLatitude();
        Double longitude = request.getLongitude();
        Double radiusKm = request.getRadiusKm();
        
        if (latitude != null && (latitude < -90.0 || latitude > 90.0)) {
            throw new InvalidCoordinatesException(
                String.format("Latitude must be between -90 and 90. Provided: %.6f", latitude)
            );
        }
        
        if (longitude != null && (longitude < -180.0 || longitude > 180.0)) {
            throw new InvalidCoordinatesException(
                String.format("Longitude must be between -180 and 180. Provided: %.6f", longitude)
            );
        }
        
        if (radiusKm != null && (radiusKm < 0.1 || radiusKm > 500.0)) {
            throw new InvalidCoordinatesException(
                String.format("Radius must be between 0.1 and 500 kilometers. Provided: %.2f", radiusKm)
            );
        }
        
        // Create pageable (no sorting needed as results are sorted by distance)
        Pageable pageable = PageRequest.of(page, size);
        
        // Delegate to service layer
        Page<NearbyHospitalResponse> results = hospitalService.findNearbyHospitals(request, pageable);
        
        return ResponseEntity.ok(results);
    }
}
