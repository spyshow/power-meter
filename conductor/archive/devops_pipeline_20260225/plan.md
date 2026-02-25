# Implementation Plan - CI/CD DevOps Pipeline

## Phase 1: Local Automation & CI Setup [checkpoint: 061167b]
- [x] Task: CI Environment Configuration [e6fd75f]
    - [x] Implement: Create `.github/workflows/main.yml` with basic triggers
    - [x] Implement: Define jobs for Backend and Frontend testing
- [x] Task: Automated Testing Pipeline [e6fd75f]
    - [x] Implement: Configure Backend test step (Node.js setup, npm install, npm test)
    - [x] Implement: Configure Frontend test step (Node.js setup, npm install, npm test)
- [x] Task: Conductor - User Manual Verification 'Local Automation & CI Setup' (Protocol in workflow.md) [061167b]

## Phase 2: Docker Hub & Image Building [checkpoint: 9b5990a]
- [x] Task: Docker Build & Push Configuration [061167b]
    - [x] Implement: Add Docker Login step using GitHub Secrets
    - [x] Implement: Add Build and Push steps for Backend image to `spyshow/power-meter:backend`
    - [x] Implement: Add Build and Push steps for Frontend image to `spyshow/power-meter:frontend`
- [x] Task: CI Optimization [061167b]
    - [x] Implement: Add Docker layer caching to speed up builds
- [x] Task: Conductor - User Manual Verification 'Docker Hub & Image Building' (Protocol in workflow.md) [9b5990a]

## Phase 3: Continuous Deployment with Watchtower [checkpoint: 5edd33a]
- [x] Task: Watchtower Integration [1694f1d]
    - [x] Implement: Add Watchtower service to `docker-compose.yml`
    - [x] Implement: Configure Watchtower to use the `nicholas-fedor/watchtower` image
    - [x] Implement: Set environment variables for polling intervals and repo monitoring
- [x] Task: Final Pipeline Hardening [f4cea50]
    - [x] Write Verification: Full end-to-end test (Push code -> CI pass -> Image push -> Watchtower update)
- [x] Task: Conductor - User Manual Verification 'Continuous Deployment with Watchtower' (Protocol in workflow.md) [f4cea50]
