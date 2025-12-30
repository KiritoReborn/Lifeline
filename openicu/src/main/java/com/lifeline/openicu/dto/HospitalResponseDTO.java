package com.lifeline.openicu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalResponseDTO {

    private Long id;
    private String name;
    private String address;
    private String phoneNumber;
    private String email;
    private Double latitude;
    private Double longitude;
    
    // Additional fields
    private String location;
    private String hospitalCategory;
    private String hospitalCareType;
    private String disciplineSystemsOfMedicine;
    private String state;
    private String district;
    private String subdistrict;
    private String pincode;
    private String telephone;
    private String mobileNumber;
    private String emergencyNum;
    private String ambulancePhoneNo;
    private String bloodbankPhoneNo;
    private String tollfree;
    private String helpline;
    private String hospitalFax;
    private String hospitalSecondaryEmailId;
    private String website;
    private String specialties;
    private String facilities;
    private String accreditation;
    private String hospitalRegisNumber;
    private String town;
    private String subtown;
    private String village;
    private String establishedYear;
    private String miscellaneousFacilities;
    private Integer numberDoctor;
    private Integer numMediconsultantOrExpert;
    private Integer totalNumBeds;
    private Integer numberPrivateWards;
    private Integer numBedForEcoWeakerSec;
    private String empanelmentOrCollaborationWith;
    private String emergencyServices;
    private String tariffRange;
    private String stateId;
    private String districtId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
