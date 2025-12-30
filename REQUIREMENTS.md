# LIFELINE OpenICU - Requirements

## Phase 3: Routing & Maps

### Backend Dependencies (Java/Spring Boot)

The backend uses standard Spring Boot 3.2.5 dependencies. No additional libraries needed for routing - GraphHopper is called via REST API.

**Configuration Required:**
```properties
# Add to application.properties
graphhopper.api.key=YOUR_GRAPHHOPPER_API_KEY
```

Get your free API key at: https://www.graphhopper.com/

---

### Frontend Dependencies (React/TypeScript)

Install with: `cd frontend && npm install`

| Package | Version | Purpose |
|---------|---------|---------|
| `leaflet` | ^1.9.4 | Interactive maps |
| `react-leaflet` | ^5.0.0 | React wrapper for Leaflet |
| `@types/leaflet` | ^1.9.21 | TypeScript types |
| `@stomp/stompjs` | ^7.2.1 | WebSocket (STOMP protocol) |
| `sockjs-client` | ^1.6.1 | WebSocket fallback |
| `@types/sockjs-client` | ^1.5.4 | TypeScript types |

---

### OSM Data (Optional - for self-hosted routing)

Downloaded but not required for cloud API:
- `graphhopper/southern-zone-latest.osm.pbf` (520MB)
- Southern India road network data

---

### New Features in This Phase

1. **GraphHopper Integration** - Real road routing via cloud API
2. **Interactive Map** - Ola/Uber-style UI with light theme
3. **Live Tracking** - Smooth ambulance animation along roads
4. **Route Visualization** - Muted red polyline with white outline

---

### Quick Start

```bash
# Backend
cd openicu
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 → Map or Live Tracking
