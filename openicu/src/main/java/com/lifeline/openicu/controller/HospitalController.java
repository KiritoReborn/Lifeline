package com.lifeline.openicu.controller;

import com.lifeline.openicu.dto.HospitalCreateDTO;
import com.lifeline.openicu.dto.HospitalResponseDTO;
import com.lifeline.openicu.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
@Validated
public class HospitalController {

    private final HospitalService hospitalService;

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
    public ResponseEntity<List<HospitalResponseDTO>> getAllHospitals() {
        List<HospitalResponseDTO> hospitals = hospitalService.getAllHospitals();
        return ResponseEntity.ok(hospitals);
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
}
