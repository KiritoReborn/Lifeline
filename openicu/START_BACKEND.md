# How to Start the Backend Server

## Prerequisites
- Java 17 or higher installed
- Maven installed (or use the included Maven wrapper)

## Quick Start

### Option 1: Using Maven Wrapper (Recommended)
```bash
cd openicu
./mvnw spring-boot:run
```

On Windows:
```bash
cd openicu
mvnw.cmd spring-boot:run
```

### Option 2: Using Maven (if installed)
```bash
cd openicu
mvn spring-boot:run
```

### Option 3: Build and Run JAR
```bash
cd openicu
./mvnw clean package
java -jar target/openicu-0.0.1-SNAPSHOT.jar
```

## Verify Backend is Running

Once started, you should see:
```
Started OpenicuApplication in X.XXX seconds
```

Then test in your browser:
```
http://localhost:8080/api/hospitals/stats
```

You should see JSON response like:
```json
{
  "totalHospitals": 1234,
  "message": "Hospital data loaded from CSV"
}
```

## Default Port
- Backend runs on: `http://localhost:8080`
- If you need a different port, add to `application.properties`:
  ```
  server.port=8080
  ```

## Troubleshooting

### Port Already in Use
If port 8080 is already in use:
1. Find what's using it: `lsof -i :8080` (Mac/Linux) or `netstat -ano | findstr :8080` (Windows)
2. Kill that process, or
3. Change port in `application.properties`: `server.port=8081`
4. Update frontend `.env` file: `VITE_API_BASE_URL=http://localhost:8081`

### Database Connection Issues
- Check that PostgreSQL database is accessible
- Verify credentials in `application.properties`
- Check network connectivity to Aiven cloud database

### Java Version
Check your Java version:
```bash
java -version
```
Should show Java 17 or higher.

## Running in Background

### Mac/Linux:
```bash
./mvnw spring-boot:run > backend.log 2>&1 &
```

### Windows (PowerShell):
```powershell
Start-Process -NoNewWindow mvnw.cmd -ArgumentList "spring-boot:run"
```
