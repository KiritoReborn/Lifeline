# Implementation Plan: Hospital Live Feed

## Overview

This implementation plan breaks down the Hospital Live Feed feature into discrete, incremental coding tasks. Each task builds on previous work, starting with WebSocket infrastructure, then adding broadcast DTOs, implementing the realtime service layer, integrating with the existing Hospital Service, and finally adding WebSocket controllers. The plan includes property-based tests and unit tests as sub-tasks to validate correctness throughout development.

## Tasks

- [x] 1. Add WebSocket dependencies to pom.xml
  - Add spring-boot-starter-websocket dependency
  - Add jqwik dependency for property-based testing
  - Verify Maven can resolve dependencies
  - _Requirements: 1.1, 1.2_

- [x] 2. Create WebSocket configuration
  - [x] 2.1 Create WebSocketConfig class in com.lifeline.openicu.config package
    - Implement WebSocketMessageBrokerConfigurer interface
    - Add @Configuration and @EnableWebSocketMessageBroker annotations
    - Configure message broker with /topic prefix
    - Set application destination prefix to /app
    - Register /ws endpoint with SockJS fallback
    - Configure CORS to allow all origins
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 2.2 Write unit tests for WebSocketConfig
    - Test message broker configuration
    - Test endpoint registration
    - _Requirements: 1.1, 1.2_

- [x] 3. Create broadcast message DTO
  - [x] 3.1 Create HospitalBroadcastMessage class in com.lifeline.openicu.realtime.hospital.dto package
    - Add fields: event, hospitalId, name, latitude, longitude, state, district, timestamp
    - Use Lombok @Data, @AllArgsConstructor, @NoArgsConstructor annotations
    - All fields should be nullable except event, hospitalId, and timestamp
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  
  - [ ]* 3.2 Write property test for HospitalBroadcastMessage
    - **Property 2: Broadcast Message Completeness**
    - **Validates: Requirements 3.1-3.9**
    - Generate random Hospital entities
    - Create broadcast messages with both CREATED and UPDATED event types
    - Verify all required fields are present (event, hospitalId, timestamp non-null)
    - Verify optional fields can be null without errors

- [x] 4. Implement HospitalRealtimeService
  - [x] 4.1 Create HospitalRealtimeService class in com.lifeline.openicu.realtime.hospital package
    - Add @Service annotation
    - Inject SimpMessagingTemplate via constructor
    - Inject HospitalRepository via constructor
    - Implement broadcastHospitalEvent(Hospital, String eventType) method
    - Implement sendAllHospitalsToClient(String sessionId) method
    - Implement private createBroadcastMessage(Hospital, String eventType) method
    - Use LocalDateTime.now() formatted as ISO 8601 for timestamps
    - Send messages to /topic/hospitals destination
    - Handle null values in optional Hospital fields gracefully
    - Add error logging for broadcast failures
    - _Requirements: 2.1, 2.2, 2.5, 3.1-3.9, 5.2, 5.3, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1_
  
  - [ ]* 4.2 Write unit tests for HospitalRealtimeService
    - Test createBroadcastMessage maps Hospital fields correctly
    - Test createBroadcastMessage handles null optional fields
    - Test broadcastHospitalEvent sends to correct topic
    - Test sendAllHospitalsToClient retrieves all hospitals
    - Mock SimpMessagingTemplate and HospitalRepository
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 4.3 Write property test for null value handling
    - **Property 4: Null Value Handling**
    - **Validates: Requirements 3.9, 7.5**
    - Generate Hospital entities with random null optional fields (latitude, longitude, state, district)
    - Create broadcast messages
    - Verify no exceptions thrown
    - Verify null fields present in message with null values
  
  - [ ]* 4.4 Write property test for timestamp format
    - **Property 8: Timestamp Format Validity**
    - **Validates: Requirements 3.8, 7.2**
    - Generate random Hospital entities
    - Create broadcast messages
    - Parse timestamp field using ISO 8601 parser
    - Verify parsing succeeds for all generated messages

- [x] 5. Checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Verify no compilation errors
  - Ask the user if questions arise

- [x] 6. Implement HospitalEventPublisher
  - [x] 6.1 Create HospitalEventPublisher class in com.lifeline.openicu.realtime.hospital package
    - Add @Component annotation
    - Inject HospitalRealtimeService via constructor
    - Implement publishHospitalCreated(Hospital) method
    - Implement publishHospitalUpdated(Hospital) method
    - Call realtimeService.broadcastHospitalEvent with appropriate event type
    - Wrap calls in try-catch to prevent exceptions from propagating
    - Log errors if broadcast fails
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.5, 8.3_
  
  - [ ]* 6.2 Write unit tests for HospitalEventPublisher
    - Test publishHospitalCreated calls RealtimeService with "HOSPITAL_CREATED"
    - Test publishHospitalUpdated calls RealtimeService with "HOSPITAL_UPDATED"
    - Test exception handling doesn't propagate to caller
    - Mock HospitalRealtimeService
    - _Requirements: 6.2, 6.3, 8.3_
  
  - [ ]* 6.3 Write property test for event type correctness
    - **Property 3: Event Type Correctness**
    - **Validates: Requirements 2.3, 2.4**
    - Generate random Hospital entities
    - Call publishHospitalCreated and verify "HOSPITAL_CREATED" event type
    - Call publishHospitalUpdated and verify "HOSPITAL_UPDATED" event type
    - Verify event type matches expected value in all cases

- [x] 7. Integrate EventPublisher with HospitalService
  - [x] 7.1 Modify HospitalService to inject HospitalEventPublisher
    - Add HospitalEventPublisher field
    - Update constructor to inject EventPublisher
    - _Requirements: 6.1_
  
  - [x] 7.2 Add event publishing to createHospital method
    - After successful save, call eventPublisher.publishHospitalCreated(savedHospital)
    - Place call after hospitalRepository.save() returns
    - _Requirements: 2.1, 6.2_
  
  - [x] 7.3 Add event publishing to updateHospital method
    - After successful save, call eventPublisher.publishHospitalUpdated(updatedHospital)
    - Place call after hospitalRepository.save() returns
    - _Requirements: 2.2, 6.3_
  
  - [ ]* 7.4 Write integration test for hospital creation broadcast
    - Create hospital via HospitalService
    - Verify EventPublisher.publishHospitalCreated was called
    - Use Mockito to spy on EventPublisher
    - _Requirements: 2.1, 6.2_
  
  - [ ]* 7.5 Write integration test for hospital update broadcast
    - Update hospital via HospitalService
    - Verify EventPublisher.publishHospitalUpdated was called
    - Use Mockito to spy on EventPublisher
    - _Requirements: 2.2, 6.3_

- [x] 8. Implement HospitalSocketController
  - [x] 8.1 Create HospitalSocketController class in com.lifeline.openicu.realtime.hospital package
    - Add @Controller annotation
    - Inject HospitalRealtimeService via constructor
    - Implement requestHospitalList method with @MessageMapping("/hospitals/list")
    - Extract session ID from SimpMessageHeaderAccessor
    - Call realtimeService.sendAllHospitalsToClient(sessionId)
    - _Requirements: 4.1, 4.2, 5.1, 5.2, 5.3_
  
  - [ ]* 8.2 Write unit tests for HospitalSocketController
    - Test requestHospitalList extracts session ID correctly
    - Test requestHospitalList calls RealtimeService
    - Mock HospitalRealtimeService and SimpMessageHeaderAccessor
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. Checkpoint - Ensure all tests pass
  - Run all unit tests, property tests, and integration tests
  - Verify WebSocket configuration loads correctly
  - Verify no compilation errors
  - Ask the user if questions arise

- [ ]* 10. Write end-to-end WebSocket integration test
  - [ ]* 10.1 Create WebSocket integration test class
    - Start embedded WebSocket server
    - Connect test client to /ws endpoint
    - Subscribe test client to /topic/hospitals
    - Trigger hospital creation via REST API
    - Verify client receives broadcast message within 1 second
    - Verify message content matches created hospital
    - **Property 1: Broadcast Delivery After Successful Commit**
    - **Validates: Requirements 2.1, 2.2, 2.5**
  
  - [ ]* 10.2 Write multiple client subscription test
    - Connect two test clients
    - Both subscribe to /topic/hospitals
    - Trigger hospital update
    - Verify both clients receive same message
    - **Property 5: Subscription Isolation**
    - **Validates: Requirements 4.3, 4.5**
  
  - [ ]* 10.3 Write hospital list request test
    - Connect test client
    - Send message to /app/hospitals/list
    - Verify client receives messages for all hospitals in database
    - Verify message count matches database count
    - **Property 6: Hospital List Completeness**
    - **Validates: Requirements 5.2, 5.3**

- [ ] 11. Final checkpoint - Verify complete functionality
  - Run full test suite (unit, property, integration)
  - Verify all tests pass
  - Verify WebSocket endpoint accessible at /ws
  - Verify broadcast messages sent to /topic/hospitals
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end WebSocket flows
- WebSocket configuration must be completed before any realtime components
- EventPublisher integration should be done after all realtime components are tested
- Use jqwik library for property-based testing in Java
- Use Spring WebSocket Test utilities for integration tests
