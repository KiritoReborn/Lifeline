package com.lifeline.openicu.sos.repository;

import com.lifeline.openicu.sos.entity.SOSReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SOSReportRepository extends JpaRepository<SOSReport, Long> {

    Optional<SOSReport> findByOfflineId(String offlineId);

    List<SOSReport> findByStatusOrderByServerTimestampDesc(String status);

    List<SOSReport> findAllByOrderByServerTimestampDesc();
}
