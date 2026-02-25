# Specification: CI/CD DevOps Pipeline

## Overview
This track focuses on implementing a complete DevOps pipeline for the MCGI Power Logger. The goal is to automate the testing, building, and deployment process using GitHub Actions, Docker Hub, and Watchtower. This ensures that every code change is validated and seamlessly deployed to the production server.

## Functional Requirements
1.  **Continuous Integration (GitHub Actions)**:
    *   Trigger on `push` to `master` (or main branch).
    *   Run linting and automated tests for both Frontend and Backend.
    *   On successful tests, build production Docker images for `backend` and `frontend`.
    *   Push tagged images to Docker Hub (`spyshow/power-meter`).
2.  **Continuous Deployment (Watchtower)**:
    *   Implement and configure the `nicholas-fedor/watchtower` service on the production server.
    *   Configure Watchtower to monitor the `spyshow/power-meter` repository on Docker Hub.
    *   Automatically pull new images and restart containers without manual intervention.
3.  **Local Development Support**:
    *   Maintain the ability to run tests and builds locally before pushing.

## Non-Functional Requirements
*   **Reliability**: Deployment only occurs if all tests pass.
*   **Security**: Use GitHub Secrets for Docker Hub credentials and sensitive environment variables.
*   **Efficiency**: Optimize Docker build times in CI using caching.

## Acceptance Criteria
*   [ ] Pushing code to GitHub triggers a GitHub Action.
*   [ ] GitHub Action successfully runs tests, builds images, and pushes to Docker Hub.
*   [ ] Images are visible in the `spyshow/power-meter` repository on Docker Hub.
*   [ ] Watchtower successfully detects a new image and updates the running containers on the server.
*   [ ] The application remains functional after an automated update.

## Out of Scope
*   Multi-environment staging (e.g., UAT/Staging servers).
*   Automatic rolling back of failed deployments.
