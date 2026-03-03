# Implementation Plan: Multi-tenant Organization & Project Management

## Phase 1: Database Migration & Schema Update
Establish the structural foundation for multi-tenancy.

- [ ] Task: Create `organizations` table [TDD]
    - [ ] Write tests for organization creation
    - [ ] Implement `organizations` table in `schema.ts` and `init.ts`
- [ ] Task: Add `organization_id` to existing tables [TDD]
    - [ ] Write tests for scoped user/telemetry retrieval
    - [ ] Update `users`, `telemetry`, `report_subscriptions` in `schema.ts` and `init.ts`
- [ ] Task: Implement Migration Script for Legacy Data [TDD]
    - [ ] Write test to verify data moves to "Default Organization"
    - [ ] Implement one-time migration logic in `init.ts`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database Migration' (Protocol in workflow.md)

## Phase 2: Backend Architecture & Isolation
Enforce data isolation at the application layer.

- [ ] Task: Update Authentication Logic [TDD]
    - [ ] Write tests for JWT containing `organization_id`
    - [ ] Update `AuthService` and `JwtStrategy`
- [ ] Task: Implement Global Organization Scoping [TDD]
    - [ ] Write tests for unauthorized cross-org access
    - [ ] Create a NestJS Interceptor or specialized Decorator to inject `orgId` into requests
- [ ] Task: Scoped Repositories and Services [TDD]
    - [ ] Write tests for filtered repository queries
    - [ ] Update `TelemetryRepository`, `ReportsService`, and `SchedulerService` to filter by `organization_id`
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Backend Isolation' (Protocol in workflow.md)

## Phase 3: Dynamic Gateway & Device Management
Move from static environment variables to dynamic database configuration.

- [ ] Task: Implement `gateways` and `devices` tables [TDD]
    - [ ] Write tests for dynamic configuration storage
    - [ ] Implement tables in `schema.ts` and `init.ts`
- [ ] Task: CRUD API for Gateways & Devices [TDD]
    - [ ] Write tests for Gateway/Device creation (Org Admin only)
    - [ ] Implement Controllers and Services for dynamic hardware config
- [ ] Task: Refactor Modbus Engine for Multi-gateway [TDD]
    - [ ] Write tests for connecting to multiple IPs simultaneously
    - [ ] Update `ModbusService` to pull configs from `gateways` table instead of `.env`
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Dynamic Management' (Protocol in workflow.md)

## Phase 4: Frontend Multi-tenancy UI
Update the dashboard to support organization-specific management.

- [ ] Task: Super Admin Management UI
    - [ ] Create UI for adding/editing Organizations and Org Admins
- [ ] Task: Org Admin Resource Management UI
    - [ ] Create management pages for Gateways and Devices
- [ ] Task: Scoped User Management
    - [ ] Update User management page to show only users within the same Org
- [ ] Task: Dashboard & Analytics Scope
    - [ ] Ensure all charts and reports respect the current user's organization context
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Frontend UI' (Protocol in workflow.md)
