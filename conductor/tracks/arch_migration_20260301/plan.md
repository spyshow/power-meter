# Implementation Plan: Architectural Migration (InfluxDB -> TimescaleDB, Express -> NestJS)

This plan outlines the staged migration of the MCGI Power Logger backend to NestJS and TimescaleDB using Drizzle ORM.

## Phase 1: Infrastructure Setup
Setup the new TimescaleDB container and scaffold the NestJS backend.

- [ ] Task: Update `docker-compose.yml` to include TimescaleDB (PostgreSQL) and remove InfluxDB
- [ ] Task: Scaffold a new NestJS backend in a `backend/` directory (or refactor existing structure)
- [ ] Task: Configure Drizzle ORM and PostgreSQL connection in NestJS
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure Setup' (Protocol in workflow.md)

## Phase 2: Data Layer Implementation
Define the database schema and implement the telemetry logging service.

- [ ] Task: Define Drizzle schema for Telemetry (Voltage, Amps, kVA) and Peaks
- [ ] Task: Implement TimescaleDB Hypertable initialization script/migration
- [ ] Task: Write failing tests for Telemetry Repository (Drizzle)
- [ ] Task: Implement Telemetry Repository to save and query 1-second data
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Data Layer Implementation' (Protocol in workflow.md)

## Phase 3: Core Service Migration (Modbus & Logging)
Port the industrial communication and logging logic to NestJS services.

- [ ] Task: Write failing tests for `ModbusService` (NestJS port of `modbus-serial` logic)
- [ ] Task: Implement `ModbusService` in NestJS
- [ ] Task: Write failing tests for `LoggingService` (orchestrates Modbus reading and DB saving)
- [ ] Task: Implement `LoggingService` in NestJS
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Core Service Migration' (Protocol in workflow.md)

## Phase 4: Feature Migration (Peaks & API)
Port the peak detection logic and API endpoints to NestJS controllers.

- [ ] Task: Write failing tests for `PeakService` (NestJS port)
- [ ] Task: Implement `PeakService` and integration with TimescaleDB
- [ ] Task: Port Telemetry and Peaks API controllers to NestJS
- [ ] Task: Port SSE (Server-Sent Events) or WebSocket logic for real-time updates
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Feature Migration' (Protocol in workflow.md)

## Phase 5: Integration & Verification
Connect the frontend to the new API and perform full system validation.

- [ ] Task: Update Frontend environment variables to point to the new NestJS API
- [ ] Task: Verify real-time dashboard updates with the new backend
- [ ] Task: Verify historical trend charts with TimescaleDB data
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Integration & Verification' (Protocol in workflow.md)
