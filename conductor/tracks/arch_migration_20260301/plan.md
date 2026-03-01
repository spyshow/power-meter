# Implementation Plan: Architectural Migration (InfluxDB -> TimescaleDB, Express -> NestJS)

This plan outlines the staged migration of the MCGI Power Logger backend to NestJS and TimescaleDB using Drizzle ORM.

## Phase 1: Infrastructure Setup [checkpoint: 404d16d]
Setup the new TimescaleDB container and scaffold the NestJS backend.

- [x] Task: Update `docker-compose.yml` to include TimescaleDB (PostgreSQL) and remove InfluxDB [03f2d16]
- [x] Task: Scaffold a new NestJS backend in a `backend/` directory (or refactor existing structure) [43fd586]
- [x] Task: Configure Drizzle ORM and PostgreSQL connection in NestJS [2696c87]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure Setup' (Protocol in workflow.md) [404d16d]

## Phase 2: Data Layer Implementation [checkpoint: a2f627f]
Define the database schema and implement the telemetry logging service.

- [x] Task: Define Drizzle schema for Telemetry (Voltage, Amps, kVA) and Peaks [d0bbc6e]
- [x] Task: Implement TimescaleDB Hypertable initialization script/migration [feea84f]
- [x] Task: Write failing tests for Telemetry Repository (Drizzle) [498655c]
- [x] Task: Implement Telemetry Repository to save and query 1-second data [498655c]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Data Layer Implementation' (Protocol in workflow.md) [a2f627f]

## Phase 3: Core Service Migration (Modbus & Logging) [checkpoint: bcaff8c]
Port the industrial communication and logging logic to NestJS services.

- [x] Task: Write failing tests for `ModbusService` (NestJS port of `modbus-serial` logic) [affcf16]
- [x] Task: Implement `ModbusService` in NestJS [affcf16]
- [x] Task: Write failing tests for `LoggingService` (orchestrates Modbus reading and DB saving) [43556ac]
- [x] Task: Implement `LoggingService` in NestJS [43556ac]
- [x] Task: Conductor - User Manual Verification 'Phase 3: Core Service Migration' (Protocol in workflow.md) [bcaff8c]

## Phase 4: Feature Migration (Peaks & API) [checkpoint: 32e9668]
Port the peak detection logic and API endpoints to NestJS controllers.

- [x] Task: Write failing tests for `PeakService` (NestJS port) [6be5b8f]
- [x] Task: Implement `PeakService` and integration with TimescaleDB [6be5b8f]
- [x] Task: Port Telemetry and Peaks API controllers to NestJS [a91dc02]
- [x] Task: Port SSE (Server-Sent Events) or WebSocket logic for real-time updates [9a0a202]
- [x] Task: Conductor - User Manual Verification 'Phase 4: Feature Migration' (Protocol in workflow.md) [32e9668]

## Phase 5: Integration & Verification [checkpoint: 06fb416]
Connect the frontend to the new API and perform full system validation.

- [x] Task: Update Frontend environment variables to point to the new NestJS API [0e76c6c]
- [x] Task: Verify real-time dashboard updates with the new backend [32e9668]
- [x] Task: Verify historical trend charts with TimescaleDB data [a91dc02]
- [x] Task: Conductor - User Manual Verification 'Phase 5: Integration & Verification' (Protocol in workflow.md) [06fb416]

## Phase: Review Fixes
- [x] Task: Apply review suggestions [3312eab]
