# Specification: Multi-tenant Organization & Project Management

## Overview
This track transforms the single-tenant MCGI Power Logger into a multi-tenant platform. The system will support multiple "Organizations," each managed by an "Organization Admin." This role can dynamically configure their own Modbus gateways, meters, and users, ensuring strict data isolation between different projects.

## Functional Requirements

### 1. Multi-tenancy Architecture
- **Organization Entity:** Create a top-level `organizations` table to act as the primary owner of all assets.
- **Data Isolation:** All data (Telemetry, Users, Gateways, Devices, Reports, Schedules) must be associated with an `organization_id`.
- **Query Scoping:** All API endpoints must enforce scoping based on the authenticated user's organization.

### 2. Role-Based Access Control (RBAC) Expansion
- **Super Admin:** Global administrator who can create/manage Organizations and assign the first Organization Admin to each.
- **Organization Admin (New):** High-level role for a specific Org. Can add/manage Gateways, Devices, Users, and Reports within their organization.
- **Scoped Roles:** Existing "Operator" and "Viewer" roles will now be restricted to viewing and interacting only with data belonging to their assigned Organization.

### 3. Dynamic Configuration
- **Gateways Management:** Move gateway configuration (IP, Port) from environment variables to a database table.
- **Device Registration:** Replace pre-defined device IDs with a dynamic system where Org Admins can add/edit devices and specify their Modbus IDs and registration parameters.

### 4. User & Access Management
- Org Admins can create and delete users for their specific organization.
- Users from one Organization cannot log in to or view data from another Organization.

## Technical Requirements
- **Database Schema Update:** Add `organization_id` to all relevant tables. Create new tables for `organizations`, `gateways`, and `devices`.
- **Backend (NestJS):** Implement a global interceptor or decorator to automatically apply organization filters to repository queries based on the JWT payload.
- **Frontend (Refine):** Update the UI to include management pages for Gateways and Devices (Org Admin only) and Organization management (Super Admin only).

## Acceptance Criteria
- A Super Admin can create a new Organization and an Admin for it.
- An Organization Admin can successfully add a Modbus Gateway and multiple Devices.
- Telemetry data recorded for Device A in Org 1 is not visible to any user in Org 2.
- Existing data is successfully migrated to a "Default Organization."

## Out of Scope
- Cross-organization data sharing or aggregation.
- White-labeling (custom logos/branding per organization).
- Billing/Subscription management logic.
