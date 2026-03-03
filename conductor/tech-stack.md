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
- **Authentication:** JWT (JSON Web Tokens) with Passport.js
- **Security:** BCrypt for password hashing
- **Task Scheduling:** @nestjs/schedule (Cron-based)
- **PDF Engine:** Puppeteer (Headless Chrome)
- **Excel Engine:** ExcelJS

## Database
- **Primary:** TimescaleDB (PostgreSQL-based time-series database)
- **ORM:** Drizzle ORM (Type-safe data access)
- **Secondary:** None (Config/User data consolidated into TimescaleDB)

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
