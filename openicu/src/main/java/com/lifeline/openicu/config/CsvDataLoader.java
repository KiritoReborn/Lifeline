package com.lifeline.openicu.config;

import com.lifeline.openicu.entity.Hospital;
import com.lifeline.openicu.repository.HospitalRepository;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CsvDataLoader implements CommandLineRunner {

    private final HospitalRepository hospitalRepository;

    public CsvDataLoader(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (hospitalRepository.count() > 0) {
            System.out.println("Hospitals already loaded. Skipping CSV load.");
            return;
        }

        System.out.println("Loading hospitals from CSV...");

        File csvFile = new File("hospital_directory.csv");
        if (!csvFile.exists()) {
            System.out.println("hospital_directory.csv not found in working directory!");
            return;
        }

        try (FileReader fileReader = new FileReader(csvFile, StandardCharsets.UTF_8);
                CSVReader csvReader = new CSVReaderBuilder(fileReader).withSkipLines(1).build()) {

            List<Hospital> hospitals = new ArrayList<>();
            String[] record;

            while (true) {
                try {
                    record = csvReader.readNext();
                    if (record == null) {
                        break;
                    }
                    try {
                        Hospital hospital = mapRecordToHospital(record);
                        hospitals.add(hospital);
                    } catch (Exception e) {
                        // Log but continue
                        // System.err.println("Error parsing record: " + e.getMessage());
                    }
                } catch (Exception e) {
                    System.err.println("Skipping malformed CSV line: " + e.getMessage());
                }
            }

            System.out.println("Found " + hospitals.size() + " hospitals in CSV. Saving...");

            int savedCount = 0;
            for (Hospital h : hospitals) {
                try {
                    hospitalRepository.save(h);
                    savedCount++;
                } catch (Exception e) {
                    System.err.println("Failed to save hospital " + h.getName() + ": " + e.getMessage());
                }
            }

            if (savedCount > 0) {
                System.out.println("Successfully loaded " + savedCount + " hospitals from CSV.");
            } else {
                System.out.println("No hospitals saved.");
            }
        } catch (Exception e) {
            System.err.println("Failed to load CSV: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private Hospital mapRecordToHospital(String[] record) {
        Hospital h = new Hospital();

        // Mapping based on CSV structure (approximate indices based on header)
        // "Sr_No","Location_Coordinates","Location","Hospital_Name", ...

        // 1. Location Coordinates (Index 1)
        String coordinates = get(record, 1);
        if (StringUtils.hasText(coordinates)) {
            try {
                String[] parts = coordinates.split(",");
                if (parts.length == 2) {
                    h.setLatitude(Double.parseDouble(parts[0].trim()));
                    h.setLongitude(Double.parseDouble(parts[1].trim()));
                }
            } catch (NumberFormatException e) {
                // Ignore invalid coordinates
            }
        }

        // 2. Location (Index 2)
        h.setLocation(get(record, 2));

        // 3. Name (Index 3)
        h.setName(get(record, 3));

        // 4. Category (Index 4)
        h.setHospitalCategory(get(record, 4));

        // 5. Care Type (Index 5)
        h.setHospitalCareType(get(record, 5));

        // 6. Discipline (Index 6)
        h.setDisciplineSystemsOfMedicine(get(record, 6));

        // 7. Address (Index 7)
        h.setAddress(get(record, 7));

        // 8. State (Index 8)
        h.setState(get(record, 8));

        // 9. District (Index 9)
        h.setDistrict(get(record, 9));

        // 10. Subdistrict (Index 10)
        h.setSubdistrict(get(record, 10));

        // 11. Pincode (Index 11)
        h.setPincode(get(record, 11));

        // 12. Telephone (Index 12)
        h.setTelephone(get(record, 12));

        // 13. Mobile (Index 13)
        h.setMobileNumber(get(record, 13));

        // 14. Emergency Num (Index 14)
        h.setEmergencyNum(get(record, 14));

        // 15. Ambulance Phone (Index 15)
        h.setAmbulancePhoneNo(get(record, 15));

        // 16. Bloodbank Phone (Index 16)
        h.setBloodbankPhoneNo(get(record, 16));

        // 17. Foreign pcare - skipped or mapped if needed (Index 17)

        // 18. Tollfree (Index 18)
        h.setTollfree(get(record, 18));

        // 19. Helpline (Index 19)
        h.setHelpline(get(record, 19));

        // 20. Fax (Index 20)
        h.setHospitalFax(get(record, 20));

        // 21. Primary Email (Index 21) - likely mapped to 'email'
        h.setEmail(get(record, 21));

        // 22. Secondary Email (Index 22)
        h.setHospitalSecondaryEmailId(get(record, 22));

        // 23. Website (Index 23)
        h.setWebsite(get(record, 23));

        // 24. Specialties (Index 24)
        h.setSpecialties(get(record, 24));

        // 25. Facilities (Index 25)
        h.setFacilities(get(record, 25));

        // 26. Accreditation (Index 26)
        h.setAccreditation(get(record, 26));

        // 27. Reg Number (Index 27)
        h.setHospitalRegisNumber(get(record, 27));

        // ... skipping scan ...

        // 32. Town (Index 32)
        h.setTown(get(record, 32));

        // 33. Subtown (Index 33)
        h.setSubtown(get(record, 33));

        // 34. Village (Index 34)
        h.setVillage(get(record, 34));

        // 35. Established Year (Index 35)
        String year = get(record, 35);
        if (year != null && year.length() > 50) {
            year = null; // Truncate or ignore invalid year
        }
        h.setEstablishedYear(year);

        // ...

        // 37. Misc Facilities (Index 37)
        h.setMiscellaneousFacilities(get(record, 37));

        // 38. Number Doctor (Index 38)
        h.setNumberDoctor(parseInt(get(record, 38)));

        // 39. Num Mediconsultant (Index 39)
        h.setNumMediconsultantOrExpert(parseInt(get(record, 39)));

        // 40. Total Beds (Index 40)
        h.setTotalNumBeds(parseInt(get(record, 40)));

        // 41. Private Wards (Index 41)
        h.setNumberPrivateWards(parseInt(get(record, 41)));

        // 42. Eco Weaker Sec Beds (Index 42)
        h.setNumBedForEcoWeakerSec(parseInt(get(record, 42)));

        // 43. Empanelment (Index 43)
        h.setEmpanelmentOrCollaborationWith(get(record, 43));

        // 44. Emergency Services (Index 44)
        h.setEmergencyServices(get(record, 44));

        // 45. Tariff Range (Index 45)
        h.setTariffRange(get(record, 45));

        // 46. State ID (Index 46)
        h.setStateId(get(record, 46));

        // 47. District ID (Index 47)
        h.setDistrictId(get(record, 47));

        // Default or derived fields
        if (h.getPhoneNumber() == null && h.getTelephone() != null) {
            h.setPhoneNumber(h.getTelephone());
        }

        return h;
    }

    private String get(String[] record, int index) {
        if (index < record.length) {
            String val = record[index];
            return "0".equals(val) ? null : val; // Treat "0" as null/empty for text fields if that's the CSV
                                                 // convention, seeing a lot of "0"s
        }
        return null;
    }

    private Integer parseInt(String val) {
        if (val == null || val.trim().isEmpty() || "0".equals(val)) {
            return 0;
        }
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
