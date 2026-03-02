# Implementation Plan: Custom Report Generation

## Phase 1: Backend Infrastructure & Data Processing [checkpoint: d2fe9b3]
- [x] Task: Report Data Aggregation Logic [80490cf]
- [x] Task: Excel Generation Service (Initial) [0f14161]
- [x] Task: PDF Generation Service (Initial Puppeteer) [0f14161]
- [x] Task: Local Storage & File Management [0f14161]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend Infrastructure' (Protocol in workflow.md) [d2fe9b3]

## Phase 2: Refined Generation Engines (XLSX/PDF)
Enhance initial services to meet the updated specification.
- [x] Task: Update XLSX Engine for Multi-Sheet Structure [495d2f1]
    - [x] Write tests for device-per-sheet logic
    - [x] Implement multi-sheet generation in `src/reports.ts`
- [ ] Task: Enhance PDF Engine with Charts and Summaries
    - [ ] Create HTML/CSS templates for the summary and charts
    - [ ] Implement data injection into Puppeteer templates
- [ ] Task: Create `/api/reports/preview` and `/api/reports/download` endpoints
    - [ ] Implement controllers for preview (JSON) and download (Stream)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Generation Engines' (Protocol in workflow.md)

## Phase 3: Frontend Reports Page & Configuration
- [ ] Task: Create Reports Configuration UI
    - [ ] Implement Multi-select for Devices/Metrics and RangePicker for time
- [ ] Task: Implement Preview and Download functionality
    - [ ] Connect UI to preview/download API endpoints
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend UI' (Protocol in workflow.md)

## Phase 4: Subscription & Scheduling System
- [ ] Task: Implement Subscription Storage (SQLite/JSON)
    - [ ] Create storage for report configs and schedules
- [ ] Task: Implement Background Scheduler (Cron)
    - [ ] Support Standard, Calendar, and Cron-based scheduling
    - [ ] Implement background generator saving to `/reports`
- [ ] Task: Update Docker Configuration
    - [ ] Map host volume for `/reports`
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Subscriptions' (Protocol in workflow.md)
