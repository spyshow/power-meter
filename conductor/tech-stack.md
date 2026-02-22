# Technology Stack

## Frontend
- **Framework:** Refine (React-based)
- **UI Library:** Ant Design
- **Language:** TypeScript
- **State Management:** React Query (Built-in to Refine)

## Backend
- **Runtime:** Node.js
- **Framework:** NestJS (Recommended for Enterprise/Industrial apps) or Express
- **Language:** TypeScript

## Database
- **Primary:** InfluxDB (Time-series data for sensor readings)
- **Secondary:** SQLite (Optional, for configuration/user data if needed)

## Industrial Communication
- **Protocol:** Modbus TCP
- **Library:** `modbus-serial` (Node.js) - Robust and widely used.

## Infrastructure
- **Containerization:** Docker (Recommended for InfluxDB + App deployment)
