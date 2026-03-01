# Implementation Plan: User Authentication and Authorization

This plan covers the transition to NestJS, integration with TimeScaleDB, and the implementation of role-based access control.

## Phase 1: Infrastructure Setup (NestJS & TimeScaleDB)
Transition the backend to NestJS and configure the TimeScaleDB connection.

- [ ] Task: Scaffold NestJS backend in a new directory or replace existing Express logic
    - [ ] Initialize NestJS project
    - [ ] Configure environment variables for TimeScaleDB
- [ ] Task: Implement TimeScaleDB connection and User Schema
    - [ ] Create `Users` table migration in TimeScaleDB
    - [ ] Implement TypeORM or Drizzle (or raw SQL) entity for Users
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure' (Protocol in workflow.md)

## Phase 2: Authentication Core (TDD)
Implement the core login and JWT issuance logic.

- [ ] Task: Implement User Service with Password Hashing
    - [ ] Write failing tests for user creation and password hashing (BCrypt)
    - [ ] Implement `UserService.create` and `UserService.findOneByUsername`
- [ ] Task: Implement Auth Service and JWT Strategy
    - [ ] Write failing tests for credential validation and JWT generation
    - [ ] Implement `AuthService.login` and NestJS `JwtStrategy`
- [ ] Task: Create Login Endpoint
    - [ ] Write failing tests for `POST /auth/login`
    - [ ] Implement `AuthController`
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Authentication Core' (Protocol in workflow.md)

## Phase 3: Authorization & Role-Based Access Control
Protect endpoints and implement role checks.

- [ ] Task: Implement Role Guards and Decorators
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
