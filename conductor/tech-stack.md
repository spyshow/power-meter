# Technology Stack

## Frontend
- **Framework:** Refine (React-based)
- **UI Library:** Ant Design
- **Language:** TypeScript
- **State Management:** React Query (Built-in to Refine)

## Backend
- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript

## Database
- **Primary:** TimescaleDB (PostgreSQL-based time-series database)
- **ORM:** Drizzle ORM (Type-safe data access)
- **Secondary:** SQLite (Optional, for configuration/user data if needed)

## Industrial Communication
- **Protocol:** Modbus TCP
- **Library:** `modbus-serial` (Node.js) - Robust and widely used.

## Infrastructure
- **Containerization:** Docker (Recommended for TimescaleDB + App deployment)
- **Orchestration:** Docker Compose (Managing Frontend, Backend, and TimescaleDB)
- **CI/CD:** GitHub Actions (Automated testing and image building)
- **Image Registry:** Docker Hub (spyshow/power-meter)
- **Auto-Deployment:** Watchtower (nicholasfedor/watchtower)
- **Service Serving:** Nginx (Serving the frontend and proxying API requests)
