package com.lifeline.openicu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalStatsDTO {
    private long totalHospitals;
    private Map<String, Long> hospitalsByState;
    private Map<String, Long> hospitalsByCity;
}
