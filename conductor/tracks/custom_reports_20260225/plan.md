# Implementation Plan - Custom Report Generation

## Phase 1: Backend Infrastructure & Data Processing
- [ ] Task: Report Data Aggregation Logic
    - [ ] Write Verification: Unit tests for InfluxDB query aggregation (min/max/avg)
    - [ ] Implement: Backend service to query and process data based on granularity (raw/aggregated)
- [ ] Task: Excel Generation Service
    - [ ] Write Verification: Tests for creating .xlsx files from JSON data
    - [ ] Implement: Export service using `xlsx` or `exceljs` library
- [ ] Task: PDF Generation Service (Puppeteer)
    - [ ] Write Verification: Tests for PDF rendering from HTML templates
    - [ ] Implement: Puppeteer setup to render charts and tables into PDF
- [ ] Task: Local Storage & File Management
    - [ ] Implement: Utility to save files to `reports/` folder and manage filenames
- [ ] Task: Conductor - User Manual Verification 'Backend Infrastructure' (Protocol in workflow.md)

## Phase 2: Frontend Report Page & Configuration
- [ ] Task: Report Configuration UI
    - [ ] Write Verification: Tests for device/metric/time selection form
    - [ ] Implement: New "Reports" page with Ant Design selection components
- [ ] Task: Report Preview View
    - [ ] Implement: Display Trend Chart and Data Table in the browser before export
- [ ] Task: Conductor - User Manual Verification 'Frontend UI' (Protocol in workflow.md)

## Phase 3: Integration & Archive Management
- [ ] Task: Export Endpoints Integration
    - [ ] Implement: Frontend buttons to trigger PDF/Excel downloads via Backend
- [ ] Task: Report History & Archive Page
    - [ ] Implement: API to list files in `reports/` folder
    - [ ] Implement: UI to browse and download archived reports
- [ ] Task: Scheduling / Subscription Logic
    - [ ] Implement: Simple cron-based mechanism to automate report generation
- [ ] Task: Conductor - User Manual Verification 'Integration & Archive' (Protocol in workflow.md)

## Phase 4: Hardening & Deployment
- [ ] Task: Docker Optimization for Puppeteer
    - [ ] Implement: Update Dockerfile to include Chromium dependencies for PDF generation
- [ ] Task: Performance Tuning
    - [ ] Implement: Stream large data exports to prevent memory issues
- [ ] Task: Conductor - User Manual Verification 'Hardening & Deployment' (Protocol in workflow.md)
