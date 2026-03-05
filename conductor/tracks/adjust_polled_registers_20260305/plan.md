# Implementation Plan: Adjust Polled Registers & Adaptation

## Phase 1: Database & Backend Core (TDD)
Update the data model and polling engine to support 6 metrics.

- [ ] Task: Update telemetry Table Schema [TDD]
    - [ ] Write tests for new schema columns (active_power, reactive_power, apparent_power, power_factor)
    - [ ] Update backend/src/database/schema.ts and init.ts
- [ ] Task: Update Telemetry Repository [TDD]
    - [ ] Write failing tests for creating and retrieving 6-metric telemetry
    - [ ] Update TelemetryRepository.create and getHistory aggregation logic
- [ ] Task: Update Modbus Polling Logic [TDD]
    - [ ] Write tests for LoggingService using the new 0-based registers
    - [ ] Implement new register addresses in LoggingService and update pollDevice
- [ ] Task: Update Peak Tracking Service [TDD]
    - [ ] Write tests for multi-metric peak detection
    - [ ] Update PeakService to track peaks for all 6 metrics
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend Core' (Protocol in workflow.md)

## Phase 2: Reporting Engine Adaptation (TDD)
Ensure reports correctly reflect the expanded data set.

- [ ] Task: Update Reports Generation Logic [TDD]
    - [ ] Write tests for PDF/Excel generation with 6 columns
    - [ ] Update ReportsService to include new metrics in fixed column reports
- [ ] Task: Verify Scheduler Compatibility
    - [ ] Ensure automated reports process the new telemetry structure without errors
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Reporting' (Protocol in workflow.md)

## Phase 3: Frontend UI Adaptation (TDD)
Update the dashboard and charts to display the new data.

- [ ] Task: Update Dashboard Device Cards [TDD]
    - [ ] Write tests for DeviceCard 2x3 grid layout
    - [ ] Implement grid layout and display all 6 metrics in real-time
- [ ] Task: Update Trend Charts [TDD]
    - [ ] Write tests for chart data mapping with 6 metrics
    - [ ] Update frontend chart components to support viewing Active/Reactive Power and Power Factor
- [ ] Task: Update Peaks View [TDD]
    - [ ] Update Peaks table to display 6 parameters
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend UI' (Protocol in workflow.md)

## Phase 4: System Integration & Cleanup
- [ ] Task: Clear Legacy Telemetry Data
    - [ ] Perform a one-time database reset/cleanup to ensure data consistency
- [ ] Task: Final System E2E Check
    - [ ] Verify end-to-end flow: Polling -> DB -> Dashboard -> Reports
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Integration' (Protocol in workflow.md)
