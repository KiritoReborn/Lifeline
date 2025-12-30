package com.lifeline.openicu.bed.controller;

import com.lifeline.openicu.bed.dto.BedCreateDTO;
import com.lifeline.openicu.bed.dto.BedStatusUpdateDTO;
import com.lifeline.openicu.bed.dto.BedResponseDTO;
import com.lifeline.openicu.bed.dto.BedCountResponseDTO;
import com.lifeline.openicu.bed.entity.Bed;
import com.lifeline.openicu.bed.entity.BedType;
import com.lifeline.openicu.bed.service.BedService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/beds")
public class BedController {

    private final BedService bedService;

    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    @PostMapping
    public ResponseEntity<BedResponseDTO> createBed(@RequestBody BedCreateDTO bedCreateDTO) {
        Bed bed = bedService.createBed(
                bedCreateDTO.getHospitalId(),
                bedCreateDTO.getBedNumber(),
                bedCreateDTO.getBedType());
        return new ResponseEntity<>(new BedResponseDTO(bed), HttpStatus.CREATED);
    }

    @PutMapping("/{bedId}/status")
    public ResponseEntity<BedResponseDTO> updateBedStatus(
            @PathVariable Long bedId,
            @RequestBody BedStatusUpdateDTO statusUpdateDTO) {
        Bed bed = bedService.updateBedStatus(bedId, statusUpdateDTO.getBedStatus());
        return ResponseEntity.ok(new BedResponseDTO(bed));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<BedResponseDTO>> getBedsByHospital(@PathVariable Long hospitalId) {
        List<Bed> beds = bedService.getBedsByHospital(hospitalId);
        List<BedResponseDTO> response = beds.stream()
                .map(BedResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    public ResponseEntity<List<BedResponseDTO>> getAvailableBeds(
            @RequestParam Long hospitalId,
            @RequestParam BedType bedType) {
        List<Bed> beds = bedService.getAvailableBeds(hospitalId, bedType);
        List<BedResponseDTO> response = beds.stream()
                .map(BedResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available/count")
    public ResponseEntity<BedCountResponseDTO> getAvailableBedCount(
            @RequestParam Long hospitalId,
            @RequestParam BedType bedType) {
        int count = bedService.getAvailableBedCount(hospitalId, bedType);
        return ResponseEntity.ok(new BedCountResponseDTO(count));
    }

    @DeleteMapping("/{bedId}")
    public ResponseEntity<Void> deleteBed(@PathVariable Long bedId) {
        bedService.deleteBed(bedId);
        return ResponseEntity.noContent().build();
    }
}