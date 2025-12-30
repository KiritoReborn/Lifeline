package com.lifeline.openicu.ambulance.controller;

import com.lifeline.openicu.ambulance.dto.AmbulanceRequestDTO;
import com.lifeline.openicu.ambulance.dto.HospitalMatchDTO;
import com.lifeline.openicu.ambulance.service.AmbulanceRoutingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ambulance")
public class AmbulanceRoutingController {

    private final AmbulanceRoutingService ambulanceRoutingService;

    public AmbulanceRoutingController(AmbulanceRoutingService ambulanceRoutingService) {
        this.ambulanceRoutingService = ambulanceRoutingService;
    }

    /**
     * Find the nearest hospital with an available bed matching the required type.
     * Creates a 15-minute reservation for the matched bed.
     *
     * @param request contains ambulance location and required bed type
     * @return matched hospital with reserved bed information
     */
    @PostMapping("/find-nearest")
    public ResponseEntity<?> findNearestHospital(@Valid @RequestBody AmbulanceRequestDTO request) {
        try {
            HospitalMatchDTO result = ambulanceRoutingService.findNearestHospital(request);
            return ResponseEntity.ok(result);
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(java.util.Collections.singletonMap("message", e.getReason()));
        }
    }
}
