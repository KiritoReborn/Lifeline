# Planning Document - Lifeline OpenICU

## Problem Statement

During disaster scenarios, emergency responders need real-time access to hospital capacity and availability information to make critical decisions about patient routing and resource allocation. The traditional approach of phone calls and manual coordination fails under high-stress, high-volume emergency situations.

## Initial Planning Decisions

### Core Problem Areas Identified

1. **Hospital Registry Management** - Centralized database of hospital information with comprehensive metadata
2. **Real-Time Data Broadcasting** - Live updates to all connected emergency dashboards
3. **Geographic Search Capabilities** - Finding nearest hospitals with required facilities
4. **Bed Availability Tracking** - Real-time ICU and bed status management
5. **Ambulance Routing** - Optimal path finding with traffic and road conditions
6. **Reservation System** - Preventing double-booking during emergencies

### Phased Development Approach

The system was planned in three distinct phases to ensure rapid deployment of critical features:

#### Phase 1: Hospital Registry (REST API Foundation)
- **Priority**: Immediate deployment capability
- **Scope**: CRUD operations, search, filtering, geospatial queries
- **Technology**: Spring Boot REST API with H2/PostgreSQL
- **Rationale**: Establish reliable data foundation before adding real-time complexity

#### Phase 2: Real-Time Broadcasting (WebSocket Integration)
- **Priority**: Live dashboard updates
- **Scope**: WebSocket connections, STOMP messaging, event publishing
- **Technology**: Spring WebSocket with SockJS fallback
- **Rationale**: Enable real-time coordination without rebuilding Phase 1

#### Phase 3: Advanced Features (Routing & Reservations)
- **Priority**: Enhanced emergency response
- **Scope**: GraphHopper routing, bed reservations, ambulance tracking
- **Technology**: External routing APIs, React frontend with Leaflet maps
- **Rationale**: Build on stable foundation with advanced capabilities

### Module Separation Strategy

The backend was architected with clear module boundaries:

- **Hospital Module** - Core registry and search functionality
- **Bed Module** - Availability tracking and status management  
- **Ambulance Module** - Routing and reservation coordination
- **Realtime Module** - WebSocket broadcasting and event publishing
- **Routing Module** - External API integration for path optimization

This separation allows independent development, testing, and deployment of each capability while maintaining system cohesion.

### Technology Selection Rationale

- **Spring Boot 3.2.5** - Mature ecosystem, excellent WebSocket support, production-ready
- **H2 Database** - Rapid development and testing, easy PostgreSQL migration
- **STOMP over WebSocket** - Industry standard, reliable message delivery, client library availability
- **React + TypeScript** - Modern frontend with strong typing for emergency-critical applications
- **Leaflet Maps** - Lightweight, customizable mapping without vendor lock-in
- **GraphHopper API** - Reliable routing with real traffic data

### Offline-First Considerations

The system was planned with disaster scenario constraints in mind:
- Local database capability (H2) for network-isolated deployments
- SockJS fallback for unreliable network connections
- Comprehensive error handling to prevent cascade failures
- Stateless REST API design for horizontal scaling
- In-memory message broker with external broker upgrade path

## Risk Mitigation Planning

### Technical Risks
- **WebSocket Connection Failures** - SockJS fallback, connection retry logic
- **Database Performance** - Pagination, indexing, query optimization
- **External API Dependencies** - Graceful degradation, caching strategies
- **Concurrent Access** - Optimistic locking, transaction management

### Operational Risks  
- **High Load During Disasters** - Horizontal scaling design, load balancing ready
- **Data Consistency** - Event sourcing patterns, audit trails
- **Network Partitions** - Offline capability, data synchronization
- **Security** - CORS configuration, input validation, SQL injection prevention

This planning foundation enabled rapid development while maintaining system reliability for emergency response scenarios.