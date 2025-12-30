package com.lifeline.openicu.bed.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "beds", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"bed_number", "hospital_id"})
})
public class Bed {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "bed_number", nullable = false, length = 50)
    private String bedNumber;
    
    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "bed_type", nullable = false)
    private BedType bedType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "bed_status", nullable = false)
    private BedStatus bedStatus;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Default constructor
    public Bed() {}
    
    // Constructor
    public Bed(String bedNumber, Long hospitalId, BedType bedType, BedStatus bedStatus) {
        this.bedNumber = bedNumber;
        this.hospitalId = hospitalId;
        this.bedType = bedType;
        this.bedStatus = bedStatus;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getBedNumber() {
        return bedNumber;
    }
    
    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }
    
    public Long getHospitalId() {
        return hospitalId;
    }
    
    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }
    
    public BedType getBedType() {
        return bedType;
    }
    
    public void setBedType(BedType bedType) {
        this.bedType = bedType;
    }
    
    public BedStatus getBedStatus() {
        return bedStatus;
    }
    
    public void setBedStatus(BedStatus bedStatus) {
        this.bedStatus = bedStatus;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}