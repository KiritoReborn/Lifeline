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
    public ResponseEntity<HospitalMatchDTO> findNearestHospital(@Valid @RequestBody AmbulanceRequestDTO request) {
        HospitalMatchDTO result = ambulanceRoutingService.findNearestHospital(request);
        return ResponseEntity.ok(result);
    }
}
