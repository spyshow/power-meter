# Specification: User Authentication and Authorization

## Overview
This track implements a robust user authentication and authorization system for the MCGI Power Logger. It will restrict access to sensitive data and management features based on user roles (Admin, Operator, Viewer). The backend will be transitioned to/implemented using **NestJS** and **TimeScaleDB** (for user data storage).

## Functional Requirements

### 1. User Authentication
- **Login Page:** A secure login screen for users to enter credentials.
- **Credential Storage:** Hashed passwords stored in **TimeScaleDB**.
- **Session Management:** Secure **JWT (JSON Web Tokens)** for stateless authentication.
- **Initial Password:** Admins will manually set the initial password for new users.

### 2. User Authorization (Role-Based Access Control)
- **Roles:**
    - **Admin:** Full access (View data, Manage users, System settings).
    - **Operator:** Can view data and trigger on-demand reports (No user management).
    - **Viewer (Read-only):** View-only access to dashboards and trends.
- **Access Control:** All API endpoints and UI routes will be protected based on these roles.

### 3. Admin Management Dashboard
- **User CRUD:** Admin can create, read, update, and delete user accounts.
- **Role Assignment:** Admin can assign and change user roles (Admin, Operator, Viewer).
- **No Self-Registration:** Only Admins can add new users to the system.

### 4. UI Adjustments
- **Navigation:** Adjust navigation menus to hide/show links based on user role.
- **Unauthorized Access:** Clear error pages/messages for unauthorized access attempts.

## Non-Functional Requirements
- **Security:** Use industry-standard hashing (e.g., Argon2 or BCrypt) for passwords.
- **Performance:** Efficient user and role lookups in TimeScaleDB.
- **Scalability:** Design role checks to be easily extensible for future roles.

## Acceptance Criteria
- [ ] Only authorized users can log in to the system.
- [ ] Users see only the features and data permitted by their assigned role.
- [ ] Admins can successfully create and manage user accounts via a dedicated dashboard.
- [ ] Standard users cannot access Admin management features.
- [ ] Unauthorized users are redirected to the login page or receive a 401/403 error.

## Out of Scope
- Password recovery/reset (Manual Admin reset only for now).
- Multi-factor authentication (MFA).
- Single Sign-On (SSO) integration.
