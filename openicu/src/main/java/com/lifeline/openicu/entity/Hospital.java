package com.lifeline.openicu.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "hospitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Hospital name is required")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone_number", length = 255)
    private String phoneNumber;

    @Column(length = 255)
    private String email;

    @Min(value = -90, message = "Latitude must be between -90 and 90")
    @Max(value = 90, message = "Latitude must be between -90 and 90")
    @Column(nullable = true)
    private Double latitude;

    @Min(value = -180, message = "Longitude must be between -180 and 180")
    @Max(value = 180, message = "Longitude must be between -180 and 180")
    @Column(nullable = true)
    private Double longitude;

    // Additional fields from CSV
    @Column(length = 255)
    private String location;

    @Column(length = 255)
    private String hospitalCategory;

    @Column(length = 255)
    private String hospitalCareType;

    @Column(length = 255)
    private String disciplineSystemsOfMedicine;

    @Column(length = 255)
    private String state;

    @Column(length = 255)
    private String district;

    @Column(length = 255)
    private String subdistrict;

    @Column(length = 255)
    private String pincode;

    @Column(length = 255)
    private String telephone;

    @Column(length = 255)
    private String mobileNumber;

    @Column(length = 255)
    private String emergencyNum;

    @Column(length = 255)
    private String ambulancePhoneNo;

    @Column(length = 255)
    private String bloodbankPhoneNo;

    @Column(length = 255)
    private String tollfree;

    @Column(length = 255)
    private String helpline;

    @Column(length = 255)
    private String hospitalFax;

    @Column(length = 255)
    private String hospitalSecondaryEmailId;

    @Column(length = 255)
    private String website;

    @Column(columnDefinition = "TEXT")
    private String specialties;

    @Column(columnDefinition = "TEXT")
    private String facilities;

    @Column(length = 255)
    private String accreditation;

    @Column(length = 255)
    private String hospitalRegisNumber;

    @Column(length = 255)
    private String town;

    @Column(length = 255)
    private String subtown;

    @Column(length = 255)
    private String village;

    @Column(length = 100)
    private String establishedYear;

    @Column(columnDefinition = "TEXT")
    private String miscellaneousFacilities;

    @Column(name = "number_doctor")
    private Integer numberDoctor;

    @Column(name = "num_mediconsultant_or_expert")
    private Integer numMediconsultantOrExpert;

    @Column(name = "total_num_beds")
    private Integer totalNumBeds;

    @Column(name = "number_private_wards")
    private Integer numberPrivateWards;

    @Column(name = "num_bed_for_eco_weaker_sec")
    private Integer numBedForEcoWeakerSec;

    @Column(columnDefinition = "TEXT")
    private String empanelmentOrCollaborationWith;

    @Column(columnDefinition = "TEXT")
    private String emergencyServices;

    @Column(length = 255)
    private String tariffRange;

    @Column(name = "state_id", length = 255)
    private String stateId;

    @Column(name = "district_id", length = 255)
    private String districtId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
