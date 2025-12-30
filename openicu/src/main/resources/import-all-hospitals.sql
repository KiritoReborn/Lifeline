-- Import ALL hospitals from CSV (including those without coordinates)
-- This will import all 20k+ records

-- Step 1: Clear existing data
TRUNCATE TABLE hospitals RESTART IDENTITY CASCADE;

-- Step 2: Create temporary staging table
CREATE TEMP TABLE hospital_staging (
    sr_no TEXT,
    location_coordinates TEXT,
    location TEXT,
    hospital_name TEXT,
    hospital_category TEXT,
    hospital_care_type TEXT,
    discipline_systems_of_medicine TEXT,
    address_original_first_line TEXT,
    state TEXT,
    district TEXT,
    subdistrict TEXT,
    pincode TEXT,
    telephone TEXT,
    mobile_number TEXT,
    emergency_num TEXT,
    ambulance_phone_no TEXT,
    bloodbank_phone_no TEXT,
    foreign_pcare TEXT,
    tollfree TEXT,
    helpline TEXT,
    hospital_fax TEXT,
    hospital_primary_email_id TEXT,
    hospital_secondary_email_id TEXT,
    website TEXT,
    specialties TEXT,
    facilities TEXT,
    accreditation TEXT,
    hospital_regis_number TEXT,
    registeration_number_scan TEXT,
    nodal_person_info TEXT,
    nodal_person_tele TEXT,
    nodal_person_email_id TEXT,
    town TEXT,
    subtown TEXT,
    village TEXT,
    establised_year TEXT,
    ayush TEXT,
    miscellaneous_facilities TEXT,
    number_doctor TEXT,
    num_mediconsultant_or_expert TEXT,
    total_num_beds TEXT,
    number_private_wards TEXT,
    num_bed_for_eco_weaker_sec TEXT,
    empanelment_or_collaboration_with TEXT,
    emergency_services TEXT,
    tariff_range TEXT,
    state_id TEXT,
    district_id TEXT
);

-- Step 3: Load CSV data (FAST!)
\COPY hospital_staging FROM 'C:/Users/Raghu/Desktop/Hackathons/Lifeline/openicu/hospital_directory.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',', QUOTE '"', ENCODING 'UTF8');

-- Step 4: Insert ALL records into hospitals table
INSERT INTO hospitals (
    name, address, phone_number, email, latitude, longitude,
    location, hospital_category, hospital_care_type, discipline_systems_of_medicine,
    state, district, subdistrict, pincode,
    telephone, mobile_number, emergency_num, ambulance_phone_no, bloodbank_phone_no,
    tollfree, helpline, hospital_fax, hospital_secondary_email_id, website,
    specialties, facilities, accreditation, hospital_regis_number,
    town, subtown, village, established_year, miscellaneous_facilities,
    number_doctor, num_mediconsultant_or_expert, total_num_beds,
    number_private_wards, num_bed_for_eco_weaker_sec,
    empanelment_or_collaboration_with, emergency_services, tariff_range,
    state_id, district_id, created_at, updated_at
)
SELECT 
    -- Required fields (only name is truly required now)
    TRIM(hospital_name),
    CASE WHEN TRIM(address_original_first_line) != '' AND TRIM(address_original_first_line) != '0' 
         THEN REPLACE(TRIM(address_original_first_line), '\n', E'\n') 
         ELSE NULL END,
    CASE WHEN TRIM(telephone) != '' AND TRIM(telephone) != '0' 
         THEN REGEXP_REPLACE(TRIM(telephone), '\s+', ' ', 'g')
         WHEN TRIM(mobile_number) != '' AND TRIM(mobile_number) != '0'
         THEN REGEXP_REPLACE(TRIM(mobile_number), '\s+', ' ', 'g')
         ELSE NULL END,
    CASE WHEN hospital_primary_email_id LIKE '%@%' 
         THEN TRIM(hospital_primary_email_id)
         ELSE NULL END,
    
    -- Parse coordinates (allow NULL for records without coordinates)
    CASE 
        WHEN location_coordinates IS NOT NULL 
             AND location_coordinates != ''
             AND TRIM(SPLIT_PART(location_coordinates, ',', 1)) ~ '^-?\d+\.?\d*$'
        THEN CAST(TRIM(SPLIT_PART(location_coordinates, ',', 1)) AS DOUBLE PRECISION)
        ELSE NULL 
    END,
    CASE 
        WHEN location_coordinates IS NOT NULL 
             AND location_coordinates != ''
             AND TRIM(SPLIT_PART(location_coordinates, ',', 2)) ~ '^-?\d+\.?\d*$'
        THEN CAST(TRIM(SPLIT_PART(location_coordinates, ',', 2)) AS DOUBLE PRECISION)
        ELSE NULL 
    END,
    
    -- Additional fields with data cleaning
    CASE WHEN TRIM(location) != '' AND TRIM(location) != '0' THEN TRIM(location) ELSE NULL END,
    CASE WHEN TRIM(hospital_category) != '' AND TRIM(hospital_category) != '0' THEN TRIM(hospital_category) ELSE NULL END,
    CASE WHEN TRIM(hospital_care_type) != '' AND TRIM(hospital_care_type) != '0' THEN TRIM(hospital_care_type) ELSE NULL END,
    CASE WHEN TRIM(discipline_systems_of_medicine) != '' AND TRIM(discipline_systems_of_medicine) != '0' THEN TRIM(discipline_systems_of_medicine) ELSE NULL END,
    CASE WHEN TRIM(state) != '' AND TRIM(state) != '0' THEN TRIM(state) ELSE NULL END,
    CASE WHEN TRIM(district) != '' AND TRIM(district) != '0' THEN TRIM(district) ELSE NULL END,
    CASE WHEN TRIM(subdistrict) != '' AND TRIM(subdistrict) != '0' THEN TRIM(subdistrict) ELSE NULL END,
    CASE WHEN TRIM(pincode) != '' AND TRIM(pincode) != '0' THEN TRIM(pincode) ELSE NULL END,
    CASE WHEN TRIM(telephone) != '' AND TRIM(telephone) != '0' THEN REGEXP_REPLACE(TRIM(telephone), '\s+', ' ', 'g') ELSE NULL END,
    CASE WHEN TRIM(mobile_number) != '' AND TRIM(mobile_number) != '0' THEN REGEXP_REPLACE(TRIM(mobile_number), '\s+', ' ', 'g') ELSE NULL END,
    CASE WHEN TRIM(emergency_num) != '' AND TRIM(emergency_num) != '0' THEN TRIM(emergency_num) ELSE NULL END,
    CASE WHEN TRIM(ambulance_phone_no) != '' AND TRIM(ambulance_phone_no) != '0' THEN TRIM(ambulance_phone_no) ELSE NULL END,
    CASE WHEN TRIM(bloodbank_phone_no) != '' AND TRIM(bloodbank_phone_no) != '0' THEN TRIM(bloodbank_phone_no) ELSE NULL END,
    CASE WHEN TRIM(tollfree) != '' AND TRIM(tollfree) != '0' THEN TRIM(tollfree) ELSE NULL END,
    CASE WHEN TRIM(helpline) != '' AND TRIM(helpline) != '0' THEN TRIM(helpline) ELSE NULL END,
    CASE WHEN TRIM(hospital_fax) != '' AND TRIM(hospital_fax) != '0' THEN TRIM(hospital_fax) ELSE NULL END,
    CASE WHEN TRIM(hospital_secondary_email_id) != '' AND TRIM(hospital_secondary_email_id) != '0' THEN TRIM(hospital_secondary_email_id) ELSE NULL END,
    CASE WHEN TRIM(website) != '' AND TRIM(website) != '0' THEN TRIM(website) ELSE NULL END,
    CASE WHEN TRIM(specialties) != '' AND TRIM(specialties) != '0' THEN REPLACE(TRIM(specialties), '\n', E'\n') ELSE NULL END,
    CASE WHEN TRIM(facilities) != '' AND TRIM(facilities) != '0' THEN REPLACE(TRIM(facilities), '\n', E'\n') ELSE NULL END,
    CASE WHEN TRIM(accreditation) != '' AND TRIM(accreditation) != '0' THEN TRIM(accreditation) ELSE NULL END,
    CASE WHEN TRIM(hospital_regis_number) != '' AND TRIM(hospital_regis_number) != '0' THEN TRIM(hospital_regis_number) ELSE NULL END,
    CASE WHEN TRIM(town) != '' AND TRIM(town) != '0' THEN TRIM(town) ELSE NULL END,
    CASE WHEN TRIM(subtown) != '' AND TRIM(subtown) != '0' THEN TRIM(subtown) ELSE NULL END,
    CASE WHEN TRIM(village) != '' AND TRIM(village) != '0' THEN TRIM(village) ELSE NULL END,
    CASE WHEN TRIM(establised_year) != '' AND TRIM(establised_year) != '0' THEN TRIM(establised_year) ELSE NULL END,
    CASE WHEN TRIM(miscellaneous_facilities) != '' AND TRIM(miscellaneous_facilities) != '0' THEN REPLACE(TRIM(miscellaneous_facilities), '\n', E'\n') ELSE NULL END,
    
    -- Numeric fields (use BIGINT for large numbers, or skip if out of range)
    CASE WHEN number_doctor ~ '^\d+$' AND number_doctor != '0' AND CAST(number_doctor AS BIGINT) < 2147483647 THEN CAST(number_doctor AS INTEGER) ELSE NULL END,
    CASE WHEN num_mediconsultant_or_expert ~ '^\d+$' AND num_mediconsultant_or_expert != '0' AND CAST(num_mediconsultant_or_expert AS BIGINT) < 2147483647 THEN CAST(num_mediconsultant_or_expert AS INTEGER) ELSE NULL END,
    CASE WHEN total_num_beds ~ '^\d+$' AND total_num_beds != '0' AND CAST(total_num_beds AS BIGINT) < 2147483647 THEN CAST(total_num_beds AS INTEGER) ELSE NULL END,
    CASE WHEN number_private_wards ~ '^\d+$' AND number_private_wards != '0' AND CAST(number_private_wards AS BIGINT) < 2147483647 THEN CAST(number_private_wards AS INTEGER) ELSE NULL END,
    CASE WHEN num_bed_for_eco_weaker_sec ~ '^\d+$' AND num_bed_for_eco_weaker_sec != '0' AND CAST(num_bed_for_eco_weaker_sec AS BIGINT) < 2147483647 THEN CAST(num_bed_for_eco_weaker_sec AS INTEGER) ELSE NULL END,
    
    CASE WHEN TRIM(empanelment_or_collaboration_with) != '' AND TRIM(empanelment_or_collaboration_with) != '0' THEN REPLACE(TRIM(empanelment_or_collaboration_with), '\n', E'\n') ELSE NULL END,
    CASE WHEN TRIM(emergency_services) != '' AND TRIM(emergency_services) != '0' THEN REPLACE(TRIM(emergency_services), '\n', E'\n') ELSE NULL END,
    CASE WHEN TRIM(tariff_range) != '' AND TRIM(tariff_range) != '0' THEN TRIM(tariff_range) ELSE NULL END,
    CASE WHEN TRIM(state_id) != '' AND TRIM(state_id) != '0' THEN TRIM(state_id) ELSE NULL END,
    CASE WHEN TRIM(district_id) != '' AND TRIM(district_id) != '0' THEN TRIM(district_id) ELSE NULL END,
    NOW(),
    NOW()
FROM hospital_staging
WHERE 
    -- Only require hospital name (allow records without coordinates)
    hospital_name IS NOT NULL
    AND TRIM(hospital_name) != ''
    AND TRIM(hospital_name) != '0';

-- Step 5: Show comprehensive results
SELECT 
    COUNT(*) as total_hospitals_imported,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates,
    COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as without_coordinates,
    COUNT(DISTINCT state) as states_covered,
    COUNT(DISTINCT district) as districts_covered,
    COUNT(CASE WHEN specialties IS NOT NULL THEN 1 END) as with_specialties,
    COUNT(CASE WHEN facilities IS NOT NULL THEN 1 END) as with_facilities
FROM hospitals;

-- Show sample data with coordinates
SELECT 'Hospitals WITH coordinates:' as category;
SELECT id, name, state, district, latitude, longitude 
FROM hospitals 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
LIMIT 3;

-- Show sample data without coordinates
SELECT 'Hospitals WITHOUT coordinates:' as category;
SELECT id, name, state, district, latitude, longitude 
FROM hospitals 
WHERE latitude IS NULL OR longitude IS NULL
LIMIT 3;

-- Drop staging table
DROP TABLE hospital_staging;

-- Success message
SELECT 'Import completed successfully! All hospitals imported.' as status;
