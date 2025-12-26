package com.lifeline.openicu.service;

import com.lifeline.openicu.dto.HospitalCreateDTO;
import com.lifeline.openicu.dto.HospitalResponseDTO;
import com.lifeline.openicu.entity.Hospital;
import com.lifeline.openicu.exception.HospitalNotFoundException;
import com.lifeline.openicu.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    public HospitalResponseDTO createHospital(HospitalCreateDTO createDTO) {
        Hospital hospital = convertToEntity(createDTO);
        Hospital savedHospital = hospitalRepository.save(hospital);
        return convertToDTO(savedHospital);
    }

    @Transactional(readOnly = true)
    public List<HospitalResponseDTO> getAllHospitals() {
        return hospitalRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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
        return convertToDTO(updatedHospital);
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
}
