# Specification: Adjust Polled Registers & Adaptation

## Overview
This track involves updating the polling logic, data storage, and user interface to monitor a refined set of 6 electrical parameters from the PM5310 meters. The registers provided are 0-based.

## Functional Requirements

### 1. Backend: Modbus Polling Update
- Update LoggingService to poll the following 0-based registers:
    - Current Avg: 3010
    - Voltage L-L Avg: 3026
    - Active Power Total: 3060
    - Reactive Power Total: 3068
    - Apparent Power Total: 3076
    - Power Factor Total: 3084
- Note: Code logic should use these addresses directly without subtracting 1 (e.g., 3010).

### 2. Database: Schema Evolution
- Update telemetry table schema in backend/src/database/schema.ts:
    - Columns to implement: voltage, current, active_power, reactive_power, apparent_power, power_factor.
- Implementation of a "Fresh Start": existing data will be cleared or ignored.

### 3. Backend: Peak Tracking & Reports
- Update PeakService to track peaks for all 6 metrics.
- Update ReportsService (PDF/Excel) to include all 6 metrics as fixed columns.

### 4. Frontend: UI Adaptation
- Dashboard: Update DeviceCard component to use a 2x3 grid layout for all 6 metrics.
- Charts: Update history charts to support all 6 metrics (using AVG aggregation).
- Peaks: Update the Peaks view to show all 6 parameters.

## Acceptance Criteria
- Dashboard displays all 6 new metrics in a grid format using the correct 0-based registers.
- Historical charts and reports successfully render all 6 metrics.
- Peak values are correctly identified for the new parameters.

## Out of Scope
- Migration of legacy data (Fresh Start approach).
