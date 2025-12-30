package com.lifeline.openicu.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalCreateDTO {

    @NotBlank(message = "Hospital name is required")
    private String name;

    private String address;

    private String phoneNumber;

    @Email(message = "Email should be valid")
    private String email;

    @NotNull(message = "Latitude is required")
    @Min(value = -90, message = "Latitude must be between -90 and 90")
    @Max(value = 90, message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Min(value = -180, message = "Longitude must be between -180 and 180")
    @Max(value = 180, message = "Longitude must be between -180 and 180")
    private Double longitude;

    // Additional fields from CSV
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
}
