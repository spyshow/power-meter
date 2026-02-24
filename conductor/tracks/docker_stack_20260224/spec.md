# Specification: Full Stack Dockerization

## Overview
This track focuses on containerizing the entire MCGI Power Logger application to enable a single-command deployment. The solution will use Docker Compose to orchestrate the backend, frontend, and InfluxDB services, ensuring seamless communication and persistent data storage.

## Functional Requirements
1.  **Containerization**:
    *   Create a production-ready `Dockerfile` for the Backend (Node.js) using optimized multi-stage builds.
    *   Create a production-ready `Dockerfile` for the Frontend (React/Refine) using optimized multi-stage builds and Nginx.
2.  **Orchestration**:
    *   Implement a `docker-compose.yml` file defining three services: `backend`, `frontend`, and `influxdb`.
    *   Configure a private bridge network for internal service communication.
3.  **Persistence**:
    *   Configure a named Docker volume for InfluxDB to ensure telemetry data persists across container lifecycles.
4.  **Configuration**:
    *   Ensure all services utilize environment variables from an external `.env` file for sensitive configuration (Modbus credentials, InfluxDB tokens).

## Non-Functional Requirements
*   **Portability**: The stack must run on any system with Docker and Docker Compose installed.
*   **Efficiency**: Use multi-stage builds to minimize image sizes.
*   **Ease of Use**: Deployment should be achievable via `docker-compose up -d`.

## Acceptance Criteria
*   [ ] Executing `docker-compose up -d` starts all services correctly.
*   [ ] The Frontend dashboard is accessible via a browser.
*   [ ] The Backend successfully connects to the field PAS600 gateway from within its container.
*   [ ] Telemetry data persists in InfluxDB after a full stack restart (`down` and `up`).

## Out of Scope
*   Kubernetes orchestration.
*   Cloud-specific deployment scripts (e.g., AWS ECS, GCP GKE).
