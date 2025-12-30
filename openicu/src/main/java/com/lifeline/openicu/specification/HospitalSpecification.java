package com.lifeline.openicu.specification;

import com.lifeline.openicu.entity.Hospital;
import org.springframework.data.jpa.domain.Specification;

/**
 * Specification builder for dynamic Hospital queries using JPA Criteria API.
 * Each method returns a Specification that can be combined with others using AND logic.
 */
public class HospitalSpecification {

    /**
     * Filter hospitals by name (case-insensitive partial match)
     * @param name the name to search for
     * @return Specification for name filtering, or no-op if name is null/empty
     */
    public static Specification<Hospital> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("name")),
                "%" + name.toLowerCase() + "%"
            );
        };
    }

    /**
     * Filter hospitals by state (case-insensitive partial match)
     * @param state the state to filter by
     * @return Specification for state filtering, or no-op if state is null/empty
     */
    public static Specification<Hospital> hasState(String state) {
        return (root, query, criteriaBuilder) -> {
            if (state == null || state.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("state")),
                "%" + state.toLowerCase() + "%"
            );
        };
    }

    /**
     * Filter hospitals by district (case-insensitive partial match)
     * @param district the district to filter by
     * @return Specification for district filtering, or no-op if district is null/empty
     */
    public static Specification<Hospital> hasDistrict(String district) {
        return (root, query, criteriaBuilder) -> {
            if (district == null || district.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("district")),
                "%" + district.toLowerCase() + "%"
            );
        };
    }

    /**
     * Filter hospitals by category (case-insensitive partial match)
     * @param category the hospital category to filter by
     * @return Specification for category filtering, or no-op if category is null/empty
     */
    public static Specification<Hospital> hasCategory(String category) {
        return (root, query, criteriaBuilder) -> {
            if (category == null || category.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("hospitalCategory")),
                "%" + category.toLowerCase() + "%"
            );
        };
    }

    /**
     * Filter hospitals by care type (case-insensitive partial match)
     * @param careType the care type to filter by
     * @return Specification for care type filtering, or no-op if careType is null/empty
     */
    public static Specification<Hospital> hasCareType(String careType) {
        return (root, query, criteriaBuilder) -> {
            if (careType == null || careType.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("hospitalCareType")),
                "%" + careType.toLowerCase() + "%"
            );
        };
    }

    /**
     * Filter hospitals by minimum bed count
     * @param minBeds the minimum number of beds required
     * @return Specification for bed count filtering, or no-op if minBeds is null
     */
    public static Specification<Hospital> hasMinimumBeds(Integer minBeds) {
        return (root, query, criteriaBuilder) -> {
            if (minBeds == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("totalNumBeds"), minBeds);
        };
    }

    /**
     * Filter hospitals by emergency service (case-insensitive partial match)
     * @param service the emergency service to search for
     * @return Specification for emergency service filtering, or no-op if service is null/empty
     */
    public static Specification<Hospital> hasEmergencyService(String service) {
        return (root, query, criteriaBuilder) -> {
            if (service == null || service.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("emergencyServices")),
                "%" + service.toLowerCase() + "%"
            );
        };
    }

    /**
     * Filter hospitals by specialty (case-insensitive partial match)
     * @param specialty the specialty to search for
     * @return Specification for specialty filtering, or no-op if specialty is null/empty
     */
    public static Specification<Hospital> hasSpecialty(String specialty) {
        return (root, query, criteriaBuilder) -> {
            if (specialty == null || specialty.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("specialties")),
                "%" + specialty.toLowerCase() + "%"
            );
        };
    }

    /**
     * Filter hospitals by facility (case-insensitive partial match)
     * @param facility the facility to search for
     * @return Specification for facility filtering, or no-op if facility is null/empty
     */
    public static Specification<Hospital> hasFacility(String facility) {
        return (root, query, criteriaBuilder) -> {
            if (facility == null || facility.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("facilities")),
                "%" + facility.toLowerCase() + "%"
            );
        };
    }

    /**
     * Search hospitals by keyword across multiple fields (name, location, state, district, address)
     * @param keyword the keyword to search for
     * @return Specification for multi-field search, or no-op if keyword is null/empty
     */
    public static Specification<Hospital> searchByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("state")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("district")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("address")), pattern)
            );
        };
    }
}
