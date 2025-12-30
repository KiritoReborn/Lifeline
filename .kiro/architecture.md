# Architecture Document - Lifeline OpenICU

## System Architecture Overview

The Lifeline OpenICU system follows a layered architecture pattern with clear separation of concerns, designed for high availability and real-time performance during emergency scenarios.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  React + TypeScript + Leaflet Maps + WebSocket Client      │
└───────────────┬─────────────────────────┬───────────────────┘
                │ REST API (HTTP)         │ WebSocket (STOMP)
                ▼                         ▼
┌───────────────────────────────────────────────────────────────┐
│                    Spring Boot Application                     │
│  ┌─────────────────────┐      ┌──────────────────────────┐   │
│  │  REST Controllers   │      │  WebSocket Controllers   │   │
│  └──────────┬──────────┘      └───────────┬──────────────┘   │
│             │                              │                   │
│             ▼                              ▼                   │
│  ┌─────────────────────┐      ┌──────────────────────────┐   │
│  │  Service Layer      │─────▶│  Event Publishing        │   │
│  └──────────┬──────────┘      └───────────┬──────────────┘   │
│             │                              │                   │
│             ▼                              ▼                   │
│  ┌─────────────────────┐      ┌──────────────────────────┐   │
│  │  Repository Layer   │      │  Realtime Broadcasting   │   │
│  └──────────┬──────────┘      └───────────┬──────────────┘   │
│             │                              │                   │
│             ▼                              ▼                   │
│  ┌─────────────────────┐      ┌──────────────────────────┐   │
│  │  Database (H2/PG)   │      │  /topic/hospitals        │   │
│  └─────────────────────┘      └──────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Module Architecture

### Core Modules

#### Hospital Module (`com.lifeline.openicu`)
- **Controller**: `HospitalController` - REST endpoints for CRUD operations
- **Service**: `HospitalService` - Business logic and validation
- **Repository**: `HospitalRepository` - Data access with JPA specifications
- **Entity**: `Hospital` - JPA entity with comprehensive hospital metadata
- **DTOs**: Request/Response objects for API contracts

#### Bed Module (`com.lifeline.openicu.bed`)
- **Controller**: `BedController` - Bed availability and status management
- **Service**: `BedService` - Bed allocation and tracking logic
- **Repository**: `BedRepository` - Bed data persistence
- **Entity**: `Bed` - Bed information with status and type enums
- **DTOs**: Bed creation, status updates, and response objects

#### Ambulance Module (`com.lifeline.openicu.ambulance`)
- **Controller**: `AmbulanceRoutingController` - Routing and reservation endpoints
- **Service**: `AmbulanceRoutingService` - Hospital matching and routing logic
- **Repository**: `BedReservationRepository` - Reservation persistence
- **Entity**: `BedReservation` - Reservation tracking with status management
- **DTOs**: Ambulance requests and hospital matching responses

#### Realtime Module (`com.lifeline.openicu.realtime`)
- **Hospital Realtime**: WebSocket broadcasting for hospital events
  - `HospitalSocketController` - WebSocket message handling
  - `HospitalEventPublisher` - Event publishing bridge
  - `HospitalRealtimeService` - Broadcasting logic
  - `HospitalBroadcastMessage` - WebSocket message format

#### Routing Module (`com.lifeline.openicu.routing`)
- **Service**: `GraphHopperCloudService` - External API integration
- **Service**: `RoutingService` - Route calculation abstraction
- **DTOs**: Route response objects with path and timing data

## Data Flow Architecture

### REST API Flow
1. **Request** → Controller → Service → Repository → Database
2. **Response** → Database → Repository → Service → Controller → Client
3. **Event Publishing** → Service → EventPublisher → RealtimeService → WebSocket

### WebSocket Flow
1. **Client Connection** → WebSocketConfig → STOMP Endpoint
2. **Message Routing** → MessageBroker → Topic Subscription
3. **Event Broadcasting** → RealtimeService → All Subscribed Clients

### Real-Time Event Flow
```
Hospital CRUD Operation
         ↓
   Service Layer
         ↓
   Event Publisher
         ↓
   Realtime Service
         ↓
   WebSocket Broadcast
         ↓
   All Connected Clients
```

## Technology Stack Architecture

### Backend Architecture
- **Framework**: Spring Boot 3.2.5 with embedded Tomcat
- **Data Layer**: Spring Data JPA with Hibernate ORM
- **Database**: H2 (development) / PostgreSQL (production)
- **WebSocket**: Spring WebSocket with STOMP protocol
- **Messaging**: Simple in-memory broker (upgradeable to RabbitMQ)
- **Validation**: Jakarta Validation with custom validators
- **Serialization**: Jackson JSON with custom date formatting

### Frontend Architecture
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite with Hot Module Replacement
- **Mapping**: Leaflet 1.9.4 with React-Leaflet wrapper
- **WebSocket**: STOMP.js with SockJS fallback
- **Styling**: Tailwind CSS with responsive design
- **Routing**: React Router DOM for SPA navigation

## Configuration Architecture

### WebSocket Configuration
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig {
    // STOMP endpoint: /ws
    // Message broker: /topic/*
    // Application prefix: /app/*
    // SockJS fallback enabled
}
```

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    // Allow all origins for development
    // Configurable for production deployment
}
```

### Database Configuration
- **H2 Console**: Enabled for development debugging
- **JPA**: Hibernate with automatic DDL generation
- **Connection Pooling**: HikariCP (Spring Boot default)
- **Transaction Management**: Spring declarative transactions

## Scalability Architecture

### Horizontal Scaling Design
- **Stateless Services**: No server-side session storage
- **Database Connection Pooling**: Configurable pool sizes
- **Load Balancer Ready**: Session-independent WebSocket handling
- **External Message Broker**: Upgrade path from in-memory to RabbitMQ/ActiveMQ

### Performance Optimizations
- **Pagination**: Configurable page sizes (1-100 records)
- **Database Indexing**: Geographic coordinates, state/district lookups
- **Query Optimization**: JPA Specifications for dynamic queries
- **Connection Management**: WebSocket connection lifecycle handling

## Security Architecture

### Input Validation
- **Jakarta Validation**: Annotation-based validation on DTOs
- **Custom Validators**: Geographic coordinate range validation
- **SQL Injection Prevention**: JPA parameterized queries
- **XSS Protection**: JSON serialization with proper escaping

### CORS Policy
- **Development**: Allow all origins for testing
- **Production**: Configurable origin restrictions
- **WebSocket**: Origin pattern matching for connection security

## Error Handling Architecture

### Global Exception Handling
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    // Standardized error responses
    // HTTP status code mapping
    // Validation error aggregation
    // WebSocket error isolation
}
```

### Resilience Patterns
- **Circuit Breaker**: External API failure handling
- **Retry Logic**: WebSocket connection recovery
- **Graceful Degradation**: Feature availability during partial failures
- **Error Isolation**: WebSocket errors don't affect REST API

## Monitoring and Observability

### Logging Architecture
- **SLF4J + Logback**: Structured logging with configurable levels
- **Request Tracing**: HTTP request/response logging
- **WebSocket Events**: Connection and message logging
- **Error Tracking**: Exception logging with stack traces

### Health Checks
- **Spring Actuator**: Built-in health endpoints
- **Database Connectivity**: Connection pool monitoring
- **WebSocket Status**: Active connection tracking
- **External API Health**: GraphHopper service availability

This architecture provides a solid foundation for emergency response systems with real-time capabilities, horizontal scalability, and robust error handling.