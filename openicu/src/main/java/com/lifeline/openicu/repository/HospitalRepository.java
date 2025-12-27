package com.lifeline.openicu.repository;

import com.lifeline.openicu.entity.Hospital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long>, JpaSpecificationExecutor<Hospital> {

       // Simple name search
       Page<Hospital> findByNameContainingIgnoreCase(String name, Pageable pageable);

       // Multi-field search across name, location, state, district, and address
       @Query("SELECT h FROM Hospital h WHERE " +
                     "LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(h.location) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(h.state) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(h.district) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
       Page<Hospital> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

       // Native query for nearby hospitals using Haversine formula (PostgreSQL
       // compatible) - uses bounding box pre-filter for speed
       @Query(value = "SELECT * FROM (" +
                     "SELECT *, " +
                     "(6371 * acos(cos(radians(:latitude)) * cos(radians(latitude)) * " +
                     "cos(radians(longitude) - radians(:longitude)) + " +
                     "sin(radians(:latitude)) * sin(radians(latitude)))) AS distance " +
                     "FROM hospitals " +
                     "WHERE latitude IS NOT NULL AND longitude IS NOT NULL " +
                     "AND latitude BETWEEN :latitude - 0.5 AND :latitude + 0.5 " +
                     "AND longitude BETWEEN :longitude - 0.5 AND :longitude + 0.5" +
                     ") AS subq WHERE distance <= :radiusKm ORDER BY distance LIMIT 100", nativeQuery = true)
       List<Object[]> findNearbyHospitals(@Param("latitude") Double latitude,
                     @Param("longitude") Double longitude,
                     @Param("radiusKm") Double radiusKm);

       // Administrative boundary filters
       Page<Hospital> findByStateIgnoreCase(String state, Pageable pageable);

       Page<Hospital> findByDistrictIgnoreCase(String district, Pageable pageable);

       Page<Hospital> findByStateIgnoreCaseAndDistrictIgnoreCase(String state, String district, Pageable pageable);

       // Bed count filter
       Page<Hospital> findByTotalNumBedsGreaterThanEqual(Integer minBeds, Pageable pageable);

       // Category filters
       Page<Hospital> findByHospitalCategoryIgnoreCase(String category, Pageable pageable);

       Page<Hospital> findByHospitalCareTypeIgnoreCase(String careType, Pageable pageable);
}
