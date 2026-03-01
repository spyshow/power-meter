# Implementation Plan: User Authentication and Authorization

This plan covers the transition to NestJS, integration with TimeScaleDB, and the implementation of role-based access control.

## Phase 1: Infrastructure Setup (NestJS & TimeScaleDB) [checkpoint: 475f62c]
Transition the backend to NestJS and configure the TimeScaleDB connection.

- [x] Task: Scaffold NestJS backend in a new directory or replace existing Express logic [5b35c0c]
    - [x] Initialize NestJS project
    - [x] Configure environment variables for TimeScaleDB
- [x] Task: Implement TimeScaleDB connection and User Schema [98c2591]
    - [x] Create `Users` table migration in TimeScaleDB
    - [x] Implement TypeORM or Drizzle (or raw SQL) entity for Users
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure' (Protocol in workflow.md) [475f62c]

## Phase 2: Authentication Core (TDD) [checkpoint: 35e83f4]
Implement the core login and JWT issuance logic.

- [x] Task: Implement User Service with Password Hashing [279d913]
    - [x] Write failing tests for user creation and password hashing (BCrypt)
    - [x] Implement `UserService.create` and `UserService.findOneByUsername`
- [x] Task: Implement Auth Service and JWT Strategy [b0ac843]
    - [x] Write failing tests for credential validation and JWT generation
    - [x] Implement `AuthService.login` and NestJS `JwtStrategy`
- [x] Task: Create Login Endpoint [ff5cde3]
    - [x] Write failing tests for `POST /auth/login`
    - [x] Implement `AuthController`
- [x] Task: Conductor - User Manual Verification 'Phase 2: Authentication Core' (Protocol in workflow.md) [35e83f4]

## Phase 3: Authorization & Role-Based Access Control
Protect endpoints and implement role checks.

- [x] Task: Implement Role Guards and Decorators [871e2f2]
    - [ ] Create `@Roles()` decorator and `RolesGuard`
    - [ ] Write tests for unauthorized/authorized access based on roles
- [ ] Task: Protect Existing Telemetry Endpoints
    - [ ] Apply `RolesGuard` to data fetching routes (Viewer role minimum)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Authorization' (Protocol in workflow.md)

## Phase 4: Admin Management & UI Integration
Build the admin dashboard and integrate with Refine frontend.

- [ ] Task: Implement User Management Endpoints (Admin Only)
    - [ ] Write tests for User CRUD (Create, Read, Update, Delete)
    - [ ] Implement `UserController` with `@Roles(Role.Admin)`
- [ ] Task: Frontend Integration - Login Page
    - [ ] Create Login page in Refine using Ant Design
    - [ ] Implement `authProvider` in Refine to handle JWT
- [ ] Task: Frontend Integration - Admin Dashboard
    - [ ] Create User Management resource in Refine (Admin only)
    - [ ] Implement role-based navigation visibility
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Admin & UI' (Protocol in workflow.md)
