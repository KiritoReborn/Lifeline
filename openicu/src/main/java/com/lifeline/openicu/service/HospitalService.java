package com.lifeline.openicu.service;

import com.lifeline.openicu.dto.HospitalCreateDTO;
import com.lifeline.openicu.dto.HospitalResponseDTO;
import com.lifeline.openicu.dto.HospitalSearchCriteria;
import com.lifeline.openicu.dto.NearbyHospitalRequest;
import com.lifeline.openicu.dto.NearbyHospitalResponse;
import com.lifeline.openicu.entity.Hospital;
import com.lifeline.openicu.exception.HospitalNotFoundException;
import com.lifeline.openicu.realtime.hospital.HospitalEventPublisher;
import com.lifeline.openicu.repository.HospitalRepository;
import com.lifeline.openicu.specification.HospitalSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final HospitalEventPublisher eventPublisher;

    public HospitalService(HospitalRepository hospitalRepository,
                          HospitalEventPublisher eventPublisher) {
        this.hospitalRepository = hospitalRepository;
        this.eventPublisher = eventPublisher;
    }

    public HospitalResponseDTO createHospital(HospitalCreateDTO createDTO) {
        Hospital hospital = convertToEntity(createDTO);
        Hospital savedHospital = hospitalRepository.save(hospital);
        
        // Publish hospital created event for WebSocket broadcast
        eventPublisher.publishHospitalCreated(savedHospital);
        
        return convertToDTO(savedHospital);
    }

    @Transactional(readOnly = true)
    public List<HospitalResponseDTO> getAllHospitals() {
        return hospitalRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<HospitalResponseDTO> getAllHospitals(Pageable pageable) {
        Page<Hospital> hospitalPage = hospitalRepository.findAll(pageable);
        return convertToPageDTO(hospitalPage);
    }

    @Transactional(readOnly = true)
    public HospitalResponseDTO getHospitalById(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new HospitalNotFoundException(id));
        return convertToDTO(hospital);
    }

    public HospitalResponseDTO updateHospital(Long id, HospitalCreateDTO updateDTO) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new HospitalNotFoundException(id));
        
        updateEntityFromDTO(hospital, updateDTO);
        Hospital updatedHospital = hospitalRepository.save(hospital);
        
        // Publish hospital updated event for WebSocket broadcast
        eventPublisher.publishHospitalUpdated(updatedHospital);
        
        return convertToDTO(updatedHospital);
    }

    @Transactional(readOnly = true)
    public Page<HospitalResponseDTO> searchHospitals(HospitalSearchCriteria criteria, Pageable pageable) {
        // Build composite specification from all criteria using AND logic
        Specification<Hospital> specification = Specification.where(
            HospitalSpecification.searchByKeyword(criteria.getKeyword())
        )
        .and(HospitalSpecification.hasState(criteria.getState()))
        .and(HospitalSpecification.hasDistrict(criteria.getDistrict()))
        .and(HospitalSpecification.hasCategory(criteria.getCategory()))
        .and(HospitalSpecification.hasCareType(criteria.getCareType()))
        .and(HospitalSpecification.hasMinimumBeds(criteria.getMinBeds()))
        .and(HospitalSpecification.hasEmergencyService(criteria.getEmergencyService()))
        .and(HospitalSpecification.hasSpecialty(criteria.getSpecialty()))
        .and(HospitalSpecification.hasFacility(criteria.getFacility()));
        
        // Execute query with combined specifications
        Page<Hospital> hospitalPage = hospitalRepository.findAll(specification, pageable);
        
        return convertToPageDTO(hospitalPage);
    }
    
    @Transactional(readOnly = true)
    public Page<NearbyHospitalResponse> findNearbyHospitals(NearbyHospitalRequest request, Pageable pageable) {
        // Validate coordinates and radius
        if (request.getLatitude() == null || request.getLongitude() == null || request.getRadiusKm() == null) {
            throw new IllegalArgumentException("Latitude, longitude, and radius are required");
        }
        
        if (request.getRadiusKm() < 0.1 || request.getRadiusKm() > 500) {
            throw new IllegalArgumentException("Radius must be between 0.1 and 500 kilometers");
        }
        
        // Call repository native query
        List<Object[]> results = hospitalRepository.findNearbyHospitals(
            request.getLatitude(),
            request.getLongitude(),
            request.getRadiusKm()
        );
        
        // Parse Object[] results into NearbyHospitalResponse DTOs
        List<NearbyHospitalResponse> nearbyHospitals = new ArrayList<>();
        
        for (Object[] row : results) {
            // Parse hospital data from Object array
            Hospital hospital = parseHospitalFromRow(row);
            
            // Get distance (last column in the result)
            Double distance = ((Number) row[row.length - 1]).doubleValue();
            
            // Apply additional filters if provided
            boolean passesFilters = true;
            
            if (request.getMinBeds() != null && hospital.getTotalNumBeds() != null) {
                if (hospital.getTotalNumBeds() < request.getMinBeds()) {
                    passesFilters = false;
                }
            }
            
            if (request.getCategory() != null && hospital.getHospitalCategory() != null) {
                if (!hospital.getHospitalCategory().equalsIgnoreCase(request.getCategory())) {
                    passesFilters = false;
                }
            }
            
            if (request.getEmergencyService() != null && hospital.getEmergencyServices() != null) {
                if (!hospital.getEmergencyServices().toLowerCase().contains(request.getEmergencyService().toLowerCase())) {
                    passesFilters = false;
                }
            }
            
            if (passesFilters) {
                HospitalResponseDTO hospitalDTO = convertToDTO(hospital);
                NearbyHospitalResponse nearbyResponse = new NearbyHospitalResponse(hospitalDTO, distance);
                nearbyHospitals.add(nearbyResponse);
            }
        }
        
        // Apply pagination to results
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), nearbyHospitals.size());
        
        List<NearbyHospitalResponse> pageContent = nearbyHospitals.subList(start, end);
        
        return new PageImpl<>(pageContent, pageable, nearbyHospitals.size());
    }
    
    /**
     * Parse Hospital entity from native query result row
     */
    private Hospital parseHospitalFromRow(Object[] row) {
        Hospital hospital = new Hospital();
        
        int i = 0;
        hospital.setId(((BigInteger) row[i++]).longValue());
        hospital.setName((String) row[i++]);
        hospital.setAddress((String) row[i++]);
        hospital.setPhoneNumber((String) row[i++]);
        hospital.setEmail((String) row[i++]);
        hospital.setLatitude(row[i] != null ? ((Number) row[i]).doubleValue() : null); i++;
        hospital.setLongitude(row[i] != null ? ((Number) row[i]).doubleValue() : null); i++;
        hospital.setLocation((String) row[i++]);
        hospital.setHospitalCategory((String) row[i++]);
        hospital.setHospitalCareType((String) row[i++]);
        hospital.setDisciplineSystemsOfMedicine((String) row[i++]);
        hospital.setState((String) row[i++]);
        hospital.setDistrict((String) row[i++]);
        hospital.setSubdistrict((String) row[i++]);
        hospital.setPincode((String) row[i++]);
        hospital.setTelephone((String) row[i++]);
        hospital.setMobileNumber((String) row[i++]);
        hospital.setEmergencyNum((String) row[i++]);
        hospital.setAmbulancePhoneNo((String) row[i++]);
        hospital.setBloodbankPhoneNo((String) row[i++]);
        hospital.setTollfree((String) row[i++]);
        hospital.setHelpline((String) row[i++]);
        hospital.setHospitalFax((String) row[i++]);
        hospital.setHospitalSecondaryEmailId((String) row[i++]);
        hospital.setWebsite((String) row[i++]);
        hospital.setSpecialties((String) row[i++]);
        hospital.setFacilities((String) row[i++]);
        hospital.setAccreditation((String) row[i++]);
        hospital.setHospitalRegisNumber((String) row[i++]);
        hospital.setTown((String) row[i++]);
        hospital.setSubtown((String) row[i++]);
        hospital.setVillage((String) row[i++]);
        hospital.setEstablishedYear((String) row[i++]);
        hospital.setMiscellaneousFacilities((String) row[i++]);
        hospital.setNumberDoctor(row[i] != null ? ((Number) row[i]).intValue() : null); i++;
        hospital.setNumMediconsultantOrExpert(row[i] != null ? ((Number) row[i]).intValue() : null); i++;
        hospital.setTotalNumBeds(row[i] != null ? ((Number) row[i]).intValue() : null); i++;
        hospital.setNumberPrivateWards(row[i] != null ? ((Number) row[i]).intValue() : null); i++;
        hospital.setNumBedForEcoWeakerSec(row[i] != null ? ((Number) row[i]).intValue() : null); i++;
        hospital.setEmpanelmentOrCollaborationWith((String) row[i++]);
        hospital.setEmergencyServices((String) row[i++]);
        hospital.setTariffRange((String) row[i++]);
        hospital.setStateId((String) row[i++]);
        hospital.setDistrictId((String) row[i++]);
        hospital.setCreatedAt(row[i] != null ? ((Timestamp) row[i]).toLocalDateTime() : null); i++;
        hospital.setUpdatedAt(row[i] != null ? ((Timestamp) row[i]).toLocalDateTime() : null); i++;
        // Skip distance column (last one)
        
        return hospital;
    }

    private Hospital convertToEntity(HospitalCreateDTO dto) {
        Hospital hospital = new Hospital();
        hospital.setName(dto.getName());
        hospital.setAddress(dto.getAddress());
        hospital.setPhoneNumber(dto.getPhoneNumber());
        hospital.setEmail(dto.getEmail());
        hospital.setLatitude(dto.getLatitude());
        hospital.setLongitude(dto.getLongitude());
        hospital.setLocation(dto.getLocation());
        hospital.setHospitalCategory(dto.getHospitalCategory());
        hospital.setHospitalCareType(dto.getHospitalCareType());
        hospital.setDisciplineSystemsOfMedicine(dto.getDisciplineSystemsOfMedicine());
        hospital.setState(dto.getState());
        hospital.setDistrict(dto.getDistrict());
        hospital.setSubdistrict(dto.getSubdistrict());
        hospital.setPincode(dto.getPincode());
        hospital.setTelephone(dto.getTelephone());
        hospital.setMobileNumber(dto.getMobileNumber());
        hospital.setEmergencyNum(dto.getEmergencyNum());
        hospital.setAmbulancePhoneNo(dto.getAmbulancePhoneNo());
        hospital.setBloodbankPhoneNo(dto.getBloodbankPhoneNo());
        hospital.setTollfree(dto.getTollfree());
        hospital.setHelpline(dto.getHelpline());
        hospital.setHospitalFax(dto.getHospitalFax());
        hospital.setHospitalSecondaryEmailId(dto.getHospitalSecondaryEmailId());
        hospital.setWebsite(dto.getWebsite());
        hospital.setSpecialties(dto.getSpecialties());
        hospital.setFacilities(dto.getFacilities());
        hospital.setAccreditation(dto.getAccreditation());
        hospital.setHospitalRegisNumber(dto.getHospitalRegisNumber());
        hospital.setTown(dto.getTown());
        hospital.setSubtown(dto.getSubtown());
        hospital.setVillage(dto.getVillage());
        hospital.setEstablishedYear(dto.getEstablishedYear());
        hospital.setMiscellaneousFacilities(dto.getMiscellaneousFacilities());
        hospital.setNumberDoctor(dto.getNumberDoctor());
        hospital.setNumMediconsultantOrExpert(dto.getNumMediconsultantOrExpert());
        hospital.setTotalNumBeds(dto.getTotalNumBeds());
        hospital.setNumberPrivateWards(dto.getNumberPrivateWards());
        hospital.setNumBedForEcoWeakerSec(dto.getNumBedForEcoWeakerSec());
        hospital.setEmpanelmentOrCollaborationWith(dto.getEmpanelmentOrCollaborationWith());
        hospital.setEmergencyServices(dto.getEmergencyServices());
        hospital.setTariffRange(dto.getTariffRange());
        hospital.setStateId(dto.getStateId());
        hospital.setDistrictId(dto.getDistrictId());
        return hospital;
    }

    private HospitalResponseDTO convertToDTO(Hospital entity) {
        HospitalResponseDTO dto = new HospitalResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setAddress(entity.getAddress());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setEmail(entity.getEmail());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setLocation(entity.getLocation());
        dto.setHospitalCategory(entity.getHospitalCategory());
        dto.setHospitalCareType(entity.getHospitalCareType());
        dto.setDisciplineSystemsOfMedicine(entity.getDisciplineSystemsOfMedicine());
        dto.setState(entity.getState());
        dto.setDistrict(entity.getDistrict());
        dto.setSubdistrict(entity.getSubdistrict());
        dto.setPincode(entity.getPincode());
        dto.setTelephone(entity.getTelephone());
        dto.setMobileNumber(entity.getMobileNumber());
        dto.setEmergencyNum(entity.getEmergencyNum());
        dto.setAmbulancePhoneNo(entity.getAmbulancePhoneNo());
        dto.setBloodbankPhoneNo(entity.getBloodbankPhoneNo());
        dto.setTollfree(entity.getTollfree());
        dto.setHelpline(entity.getHelpline());
        dto.setHospitalFax(entity.getHospitalFax());
        dto.setHospitalSecondaryEmailId(entity.getHospitalSecondaryEmailId());
        dto.setWebsite(entity.getWebsite());
        dto.setSpecialties(entity.getSpecialties());
        dto.setFacilities(entity.getFacilities());
        dto.setAccreditation(entity.getAccreditation());
        dto.setHospitalRegisNumber(entity.getHospitalRegisNumber());
        dto.setTown(entity.getTown());
        dto.setSubtown(entity.getSubtown());
        dto.setVillage(entity.getVillage());
        dto.setEstablishedYear(entity.getEstablishedYear());
        dto.setMiscellaneousFacilities(entity.getMiscellaneousFacilities());
        dto.setNumberDoctor(entity.getNumberDoctor());
        dto.setNumMediconsultantOrExpert(entity.getNumMediconsultantOrExpert());
        dto.setTotalNumBeds(entity.getTotalNumBeds());
        dto.setNumberPrivateWards(entity.getNumberPrivateWards());
        dto.setNumBedForEcoWeakerSec(entity.getNumBedForEcoWeakerSec());
        dto.setEmpanelmentOrCollaborationWith(entity.getEmpanelmentOrCollaborationWith());
        dto.setEmergencyServices(entity.getEmergencyServices());
        dto.setTariffRange(entity.getTariffRange());
        dto.setStateId(entity.getStateId());
        dto.setDistrictId(entity.getDistrictId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private void updateEntityFromDTO(Hospital entity, HospitalCreateDTO dto) {
        entity.setName(dto.getName());
        entity.setAddress(dto.getAddress());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setEmail(dto.getEmail());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setLocation(dto.getLocation());
        entity.setHospitalCategory(dto.getHospitalCategory());
        entity.setHospitalCareType(dto.getHospitalCareType());
        entity.setDisciplineSystemsOfMedicine(dto.getDisciplineSystemsOfMedicine());
        entity.setState(dto.getState());
        entity.setDistrict(dto.getDistrict());
        entity.setSubdistrict(dto.getSubdistrict());
        entity.setPincode(dto.getPincode());
        entity.setTelephone(dto.getTelephone());
        entity.setMobileNumber(dto.getMobileNumber());
        entity.setEmergencyNum(dto.getEmergencyNum());
        entity.setAmbulancePhoneNo(dto.getAmbulancePhoneNo());
        entity.setBloodbankPhoneNo(dto.getBloodbankPhoneNo());
        entity.setTollfree(dto.getTollfree());
        entity.setHelpline(dto.getHelpline());
        entity.setHospitalFax(dto.getHospitalFax());
        entity.setHospitalSecondaryEmailId(dto.getHospitalSecondaryEmailId());
        entity.setWebsite(dto.getWebsite());
        entity.setSpecialties(dto.getSpecialties());
        entity.setFacilities(dto.getFacilities());
        entity.setAccreditation(dto.getAccreditation());
        entity.setHospitalRegisNumber(dto.getHospitalRegisNumber());
        entity.setTown(dto.getTown());
        entity.setSubtown(dto.getSubtown());
        entity.setVillage(dto.getVillage());
        entity.setEstablishedYear(dto.getEstablishedYear());
        entity.setMiscellaneousFacilities(dto.getMiscellaneousFacilities());
        entity.setNumberDoctor(dto.getNumberDoctor());
        entity.setNumMediconsultantOrExpert(dto.getNumMediconsultantOrExpert());
        entity.setTotalNumBeds(dto.getTotalNumBeds());
        entity.setNumberPrivateWards(dto.getNumberPrivateWards());
        entity.setNumBedForEcoWeakerSec(dto.getNumBedForEcoWeakerSec());
        entity.setEmpanelmentOrCollaborationWith(dto.getEmpanelmentOrCollaborationWith());
        entity.setEmergencyServices(dto.getEmergencyServices());
        entity.setTariffRange(dto.getTariffRange());
        entity.setStateId(dto.getStateId());
        entity.setDistrictId(dto.getDistrictId());
    }

    public long getTotalHospitals() {
        return hospitalRepository.count();
    }

    private Page<HospitalResponseDTO> convertToPageDTO(Page<Hospital> hospitalPage) {
        return hospitalPage.map(this::convertToDTO);
    }
    
    /**
     * Calculate distance between two points using Haversine formula
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @return Distance in kilometers
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Handle null coordinates
        if (Double.isNaN(lat1) || Double.isNaN(lon1) || Double.isNaN(lat2) || Double.isNaN(lon2)) {
            return Double.MAX_VALUE;
        }
        
        final int EARTH_RADIUS_KM = 6371;
        
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }
}
