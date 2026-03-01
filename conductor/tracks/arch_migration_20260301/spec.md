# Specification: Architectural Migration (InfluxDB -> TimescaleDB, Express -> NestJS)

## Overview
This track involves a major architectural overhaul of the MCGI Power Logger. The backend will be migrated from Express to NestJS for better structure and maintainability. Simultaneously, the primary time-series database will transition from InfluxDB to TimescaleDB (PostgreSQL-based) using Drizzle ORM for type-safe data access.

## Functional Requirements

### 1. Database Migration (TimescaleDB)
- **Primary Database**: Replace InfluxDB with TimescaleDB for telemetry data logging.
- **Data Strategy**: Fresh start with a new database schema; no migration of historical data from InfluxDB is required.
- **ORM Integration**: Utilize **Drizzle ORM** for all database interactions (telemetry, peaks, and configuration).
- **Schema Definition**: Implement a robust TimescaleDB hypertable for telemetry (Voltage, Amps, kVA) with 1-second precision.

### 2. Backend Migration (NestJS)
- **Framework**: Transition the entire backend logic from Express to **NestJS**.
- **Migration Strategy**: Port and refactor existing logic (Modbus communication, peak detection, report generation) into specialized NestJS modules.
- **Structure**: Adopt a modular NestJS architecture (Modules, Controllers, Services).
- **Industrial Communication**: Migrate `modbus-serial` integration into a dedicated NestJS service.

### 3. Infrastructure Updates
- **Containerization**: Update `docker-compose.yml` to replace the InfluxDB container with a TimescaleDB (PostgreSQL) container.
- **Persistent Storage**: Configure Docker volumes for the new TimescaleDB instance.

## Non-Functional Requirements
- **Performance**: Ensure 1-second logging frequency is maintained without performance degradation.
- **Maintainability**: Utilize NestJS dependency injection and Drizzle ORM for cleaner, more testable code.
- **Type Safety**: Leverage Drizzle ORM for end-to-end TypeScript safety in the data layer.

## Acceptance Criteria
- [ ] Backend is fully functional using NestJS modules.
- [ ] Telemetry data is successfully logged into TimescaleDB at 1-second intervals.
- [ ] All previous features (Peak monitoring, Report generation) are operational on the new stack.
- [ ] Docker Compose correctly orchestrates the new services.
- [ ] Unit and integration tests pass for all migrated components.

## Out of Scope
- Data migration of historical telemetry from InfluxDB.
- Significant changes to the Frontend UI (logic will be updated to point to new API endpoints).
