package com.lifeline.openicu.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NearbyHospitalResponse extends HospitalResponseDTO {
    
    private Double distanceKm;
    
    public NearbyHospitalResponse(HospitalResponseDTO hospital, Double distanceKm) {
        // Copy all fields from parent
        this.setId(hospital.getId());
        this.setName(hospital.getName());
        this.setAddress(hospital.getAddress());
        this.setPhoneNumber(hospital.getPhoneNumber());
        this.setEmail(hospital.getEmail());
        this.setLatitude(hospital.getLatitude());
        this.setLongitude(hospital.getLongitude());
        this.setLocation(hospital.getLocation());
        this.setHospitalCategory(hospital.getHospitalCategory());
        this.setHospitalCareType(hospital.getHospitalCareType());
        this.setDisciplineSystemsOfMedicine(hospital.getDisciplineSystemsOfMedicine());
        this.setState(hospital.getState());
        this.setDistrict(hospital.getDistrict());
        this.setSubdistrict(hospital.getSubdistrict());
        this.setPincode(hospital.getPincode());
        this.setTelephone(hospital.getTelephone());
        this.setMobileNumber(hospital.getMobileNumber());
        this.setEmergencyNum(hospital.getEmergencyNum());
        this.setAmbulancePhoneNo(hospital.getAmbulancePhoneNo());
        this.setBloodbankPhoneNo(hospital.getBloodbankPhoneNo());
        this.setTollfree(hospital.getTollfree());
        this.setHelpline(hospital.getHelpline());
        this.setHospitalFax(hospital.getHospitalFax());
        this.setHospitalSecondaryEmailId(hospital.getHospitalSecondaryEmailId());
        this.setWebsite(hospital.getWebsite());
        this.setSpecialties(hospital.getSpecialties());
        this.setFacilities(hospital.getFacilities());
        this.setAccreditation(hospital.getAccreditation());
        this.setHospitalRegisNumber(hospital.getHospitalRegisNumber());
        this.setTown(hospital.getTown());
        this.setSubtown(hospital.getSubtown());
        this.setVillage(hospital.getVillage());
        this.setEstablishedYear(hospital.getEstablishedYear());
        this.setMiscellaneousFacilities(hospital.getMiscellaneousFacilities());
        this.setNumberDoctor(hospital.getNumberDoctor());
        this.setNumMediconsultantOrExpert(hospital.getNumMediconsultantOrExpert());
        this.setTotalNumBeds(hospital.getTotalNumBeds());
        this.setNumberPrivateWards(hospital.getNumberPrivateWards());
        this.setNumBedForEcoWeakerSec(hospital.getNumBedForEcoWeakerSec());
        this.setEmpanelmentOrCollaborationWith(hospital.getEmpanelmentOrCollaborationWith());
        this.setEmergencyServices(hospital.getEmergencyServices());
        this.setTariffRange(hospital.getTariffRange());
        this.setStateId(hospital.getStateId());
        this.setDistrictId(hospital.getDistrictId());
        this.setCreatedAt(hospital.getCreatedAt());
        this.setUpdatedAt(hospital.getUpdatedAt());
        
        // Set distance
        this.distanceKm = distanceKm;
    }
}
