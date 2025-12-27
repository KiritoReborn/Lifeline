# API Endpoints Reference

Base URL: `http://localhost:8080` (or your configured backend URL)

## 🏥 Hospital Endpoints

### 1. Get All Hospitals (with pagination)
**GET** `/api/hospitals`

**Query Parameters:**
- `page` (default: 0) - Page number (0-indexed)
- `size` (default: 20) - Items per page (1-100)
- `sortBy` (default: "name") - Sort field: "name", "state", "district", "totalNumBeds", "createdAt", "updatedAt"
- `sortDir` (default: "ASC") - Sort direction: "ASC" or "DESC"

**Example:**
```bash
curl "http://localhost:8080/api/hospitals?page=0&size=20&sortBy=name&sortDir=ASC"
```

**Browser:**
```
http://localhost:8080/api/hospitals
http://localhost:8080/api/hospitals?page=0&size=10&sortBy=totalNumBeds&sortDir=DESC
```

---

### 2. Search Hospitals
**GET** `/api/hospitals/search`

**Query Parameters:**
- `keyword` - Search by name, ID, or location
- `state` - Filter by state
- `district` - Filter by district
- `category` - Filter by hospital category
- `careType` - Filter by care type
- `minBeds` - Minimum number of beds
- `emergencyService` - Filter by emergency service
- `specialty` - Filter by specialty
- `facility` - Filter by facility
- `page` (default: 0)
- `size` (default: 20)
- `sortBy` (default: "name")
- `sortDir` (default: "ASC")

**Example:**
```bash
curl "http://localhost:8080/api/hospitals/search?keyword=General&state=Karnataka&minBeds=10"
```

**Browser:**
```
http://localhost:8080/api/hospitals/search?keyword=Hospital
http://localhost:8080/api/hospitals/search?state=Karnataka&minBeds=20
```

---

### 3. Get Hospital by ID
**GET** `/api/hospitals/{id}`

**Example:**
```bash
curl "http://localhost:8080/api/hospitals/1"
```

**Browser:**
```
http://localhost:8080/api/hospitals/1
```

---

### 4. Create Hospital
**POST** `/api/hospitals`

**Request Body:**
```json
{
  "name": "City General Hospital",
  "address": "123 Main Street",
  "phoneNumber": "(555) 123-4567",
  "email": "info@hospital.com",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "state": "Karnataka",
  "district": "Bangalore",
  "totalNumBeds": 50
}
```

**Example:**
```bash
curl -X POST "http://localhost:8080/api/hospitals" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "state": "Karnataka"
  }'
```

---

### 5. Update Hospital
**PUT** `/api/hospitals/{id}`

**Request Body:** (Same as Create Hospital)

**Example:**
```bash
curl -X PUT "http://localhost:8080/api/hospitals/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Hospital Name",
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

---

### 6. Get Hospital Statistics
**GET** `/api/hospitals/stats`

**Example:**
```bash
curl "http://localhost:8080/api/hospitals/stats"
```

**Browser:**
```
http://localhost:8080/api/hospitals/stats
```

---

### 7. Find Nearby Hospitals
**POST** `/api/hospitals/nearby?page=0&size=20`

**Request Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "radiusKm": 25.0,
  "minBeds": 10,
  "category": "General",
  "emergencyService": "Yes"
}
```

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)

**Example:**
```bash
curl -X POST "http://localhost:8080/api/hospitals/nearby?page=0&size=10" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946,
    "radiusKm": 25.0
  }'
```

---

## 🛏️ Bed Endpoints

### 1. Create Bed
**POST** `/beds`

**Request Body:**
```json
{
  "hospitalId": 1,
  "bedNumber": "ICU-01",
  "bedType": "ICU"
}
```

**Bed Types:** `ICU`, `VENTILATOR`, `GENERAL`

**Example:**
```bash
curl -X POST "http://localhost:8080/beds" \
  -H "Content-Type: application/json" \
  -d '{
    "hospitalId": 1,
    "bedNumber": "ICU-01",
    "bedType": "ICU"
  }'
```

---

### 2. Update Bed Status
**PUT** `/beds/{bedId}/status`

**Request Body:**
```json
{
  "bedStatus": "OCCUPIED"
}
```

**Bed Statuses:** `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`

**Example:**
```bash
curl -X PUT "http://localhost:8080/beds/1/status" \
  -H "Content-Type: application/json" \
  -d '{
    "bedStatus": "OCCUPIED"
  }'
```

---

### 3. Get Available Beds
**GET** `/beds/available?hospitalId={id}&bedType={type}`

**Query Parameters:**
- `hospitalId` (required) - Hospital ID
- `bedType` (required) - `ICU`, `VENTILATOR`, or `GENERAL`

**Example:**
```bash
curl "http://localhost:8080/beds/available?hospitalId=1&bedType=ICU"
```

**Browser:**
```
http://localhost:8080/beds/available?hospitalId=1&bedType=ICU
```

---

### 4. Get Available Bed Count
**GET** `/beds/available/count?hospitalId={id}&bedType={type}`

**Query Parameters:**
- `hospitalId` (required)
- `bedType` (required)

**Example:**
```bash
curl "http://localhost:8080/beds/available/count?hospitalId=1&bedType=ICU"
```

**Browser:**
```
http://localhost:8080/beds/available/count?hospitalId=1&bedType=ICU
```

---

## 🚑 Ambulance Endpoints

### 1. Find Nearest Hospital
**POST** `/api/ambulance/find-nearest`

**Request Body:**
```json
{
  "ambulanceId": "AMB-001",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "requiredBedType": "ICU"
}
```

**Required Bed Types:** `ICU` or `VENTILATOR`

**Example:**
```bash
curl -X POST "http://localhost:8080/api/ambulance/find-nearest" \
  -H "Content-Type: application/json" \
  -d '{
    "ambulanceId": "AMB-001",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "requiredBedType": "ICU"
  }'
```

---

## 🧪 Quick Test Endpoints (Start Here!)

These are the easiest to test in your browser:

1. **Hospital Stats** (simplest - no params needed):
   ```
   http://localhost:8080/api/hospitals/stats
   ```

2. **Get All Hospitals** (first page):
   ```
   http://localhost:8080/api/hospitals
   ```

3. **Get Hospital by ID** (replace 1 with actual ID):
   ```
   http://localhost:8080/api/hospitals/1
   ```

4. **Search Hospitals**:
   ```
   http://localhost:8080/api/hospitals/search?keyword=Hospital
   ```

---

## 📝 Notes

- All endpoints return JSON
- POST/PUT requests require `Content-Type: application/json` header
- Pagination: `page` is 0-indexed (first page is 0)
- Sort fields must be one of: "name", "state", "district", "totalNumBeds", "createdAt", "updatedAt"
- Sort direction must be "ASC" or "DESC"
- Page size must be between 1 and 100

---

## 🔧 Testing with Browser DevTools

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to one of the GET endpoints above
4. Check the Response tab to see the data

---

## 🚨 Common Issues

- **CORS Error**: Make sure your backend has CORS enabled for `http://localhost:5173`
- **404 Not Found**: Check that the backend server is running on port 8080
- **Connection Refused**: Backend server is not running or wrong port
