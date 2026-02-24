# Specification: Device Peak Value Monitoring

## Overview
This feature adds a real-time "Peak Event" tracking system to the MCGI Power Logger. The system will monitor incoming telemetry (Voltage, Current, and Power) for all 6 devices. Whenever a new reading exceeds the previously recorded maximum for that specific device and metric, a new record is created in the database and displayed on a dedicated "Peak Analysis" page.

## Functional Requirements

### 1. Backend: Peak Detection Engine
- **State Tracking:** The backend must maintain the current "all-time max" for each (Device ID, Metric) pair in memory or via a fast lookup.
- **Comparison Logic:** Every 1-second poll, compare the incoming value against the stored max.
- **Event Logging:** If `incoming_value > current_max`:
    - Update the internal `current_max`.
    - Write a new point to InfluxDB in a dedicated measurement (e.g., `peak_events`).
    - Measurement Fields: `value`.
    - Measurement Tags: `device_id`, `metric` (voltage/current/kva).

### 2. Backend: API Endpoints
- **GET /peaks:** Returns a list of all recorded peak events, sorted by time (newest first).
- **GET /peaks/latest:** Returns the current maximum value for each metric/device combination to initialize the frontend state.

### 3. Frontend: Peak Analysis Page
- **Navigation:** Add a "Peak Analysis" item to the sidebar menu with a `RiseOutlined` icon.
- **UI Component:** A sortable and filterable Ant Design table.
- **Columns:**
    - **Device:** The name of the meter (e.g., 1000, 2000).
    - **Parameter:** The metric name (Voltage, Current, or Power).
    - **Peak Value:** The recorded value with its unit (V, A, or kVA).
    - **Recorded At:** The full date and time of the occurrence.
- **Real-time Updates:** The table should update automatically when a new peak is detected (via SSE/EventBus).

## Non-Functional Requirements
- **Performance:** Detection logic must be efficient to not interfere with the 1Hz polling loop.
- **Reliability:** The initial max values should be loaded from InfluxDB on backend startup to ensure continuity after a restart.

## Acceptance Criteria
- [ ] Backend correctly identifies and writes a new row ONLY when a value is strictly greater than the previous max.
- [ ] Peak events are persisted in InfluxDB and survive server reloads.
- [ ] The "Peak Analysis" page displays data correctly in both Light and Dark modes.
- [ ] New peaks appear in the table in real-time without a manual refresh.
