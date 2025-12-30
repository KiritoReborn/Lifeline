package com.lifeline.openicu.sos.controller;

import com.lifeline.openicu.sos.dto.SOSReportDTO;
import com.lifeline.openicu.sos.entity.SOSReport;
import com.lifeline.openicu.sos.repository.SOSReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sos")
@CrossOrigin(origins = "*")
public class SOSController {

    private static final Logger log = LoggerFactory.getLogger(SOSController.class);
    private final SOSReportRepository sosRepository;

    public SOSController(SOSReportRepository sosRepository) {
        this.sosRepository = sosRepository;
    }

    /**
     * Receive SOS report (works with offline sync)
     * Idempotent - if offlineId already exists, returns existing record
     */
    @PostMapping("/report")
    public ResponseEntity<?> reportSOS(@RequestBody SOSReportDTO dto) {
        log.info("🆘 SOS Report received: type={}, offlineId={}", dto.getEmergencyType(), dto.getOfflineId());

        // Check for duplicate (idempotent)
        if (dto.getOfflineId() != null) {
            var existing = sosRepository.findByOfflineId(dto.getOfflineId());
            if (existing.isPresent()) {
                log.info("Duplicate SOS ignored (already synced): {}", dto.getOfflineId());
                return ResponseEntity.ok(Map.of(
                        "status", "already_synced",
                        "id", existing.get().getId(),
                        "offlineId", dto.getOfflineId()));
            }
        }

        // Create new SOS report
        SOSReport report = new SOSReport(
                dto.getLatitude(),
                dto.getLongitude(),
                dto.getEmergencyType(),
                dto.getMessage(),
                dto.getClientTimestamp() != null ? dto.getClientTimestamp() : System.currentTimeMillis(),
                dto.getOfflineId());

        SOSReport saved = sosRepository.save(report);
        log.info("✅ SOS saved to database: id={}, offlineId={}", saved.getId(), saved.getOfflineId());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "status", "synced",
                "id", saved.getId(),
                "offlineId", dto.getOfflineId(),
                "message", "SOS received by command center"));
    }

    /**
     * Get all SOS reports (for command center dashboard)
     */
    @GetMapping("/reports")
    public ResponseEntity<List<SOSReport>> getAllReports() {
        List<SOSReport> reports = sosRepository.findAllByOrderByServerTimestampDesc();
        return ResponseEntity.ok(reports);
    }

    /**
     * Get pending SOS reports
     */
    @GetMapping("/reports/pending")
    public ResponseEntity<List<SOSReport>> getPendingReports() {
        List<SOSReport> reports = sosRepository.findByStatusOrderByServerTimestampDesc("PENDING");
        return ResponseEntity.ok(reports);
    }

    /**
     * Update SOS status
     */
    @PutMapping("/reports/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");

        return sosRepository.findById(id)
                .map(report -> {
                    report.setStatus(newStatus);
                    sosRepository.save(report);
                    log.info("SOS status updated: id={}, status={}", id, newStatus);
                    return ResponseEntity.ok(Map.of("status", "updated", "id", id));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
