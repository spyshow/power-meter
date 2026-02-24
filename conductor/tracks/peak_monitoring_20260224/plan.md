# Implementation Plan - Device Peak Value Monitoring

## Phase 1: Backend Peak Detection Logic [checkpoint: be719c6]
- [x] Task: Peak Storage & Detection Service [f2c0f77]
    - [ ] Write Tests: Verify peak detection logic (only update when value is strictly greater)
    - [ ] Implement: `PeakService` to track and persist peaks to InfluxDB
- [x] Task: Modbus Integration [b8ed108]
    - [ ] Write Tests: Verify `pollDevice` correctly calls `PeakService` on new data
    - [ ] Implement: Integrate `PeakService.checkPeaks()` into the 1Hz polling loop in `modbus.ts`
- [x] Task: Startup Initialization [55cd821]
    - [ ] Write Tests: Verify backend loads last known peaks from InfluxDB on startup
    - [ ] Implement: Query InfluxDB during server boot to hydrate `PeakService` memory state
- [x] Task: Conductor - User Manual Verification 'Backend Peak Detection Logic' (Protocol in workflow.md) [be719c6]

## Phase 2: API & Real-time Delivery
- [ ] Task: Peak History Endpoint
    - [ ] Write Tests: GET /peaks returns list of peak events from InfluxDB
    - [ ] Implement: `GET /peaks` controller logic
- [ ] Task: Real-time Peak Streaming
    - [ ] Write Tests: SSE stream emits a specific event when a new peak is detected
    - [ ] Implement: Add `peak_detected` event type to `eventBus` and `/events` SSE stream
- [ ] Task: Conductor - User Manual Verification 'API & Real-time Delivery' (Protocol in workflow.md)

## Phase 3: Frontend Peak Analysis Page
- [ ] Task: Page Routing & Navigation
    - [ ] Write Tests: New route `/peaks` is accessible and sidebar link exists
    - [ ] Implement: Register "Peak Analysis" resource in `App.tsx` and add to sidebar
- [ ] Task: Peaks Table Implementation
    - [ ] Write Tests: Table renders rows correctly with Device, Parameter, Value, and Time
    - [ ] Implement: `PeakAnalysis` page with Ant Design table and historical data fetching
- [ ] Task: Real-time Table Updates
    - [ ] Write Tests: Hook updates table state when `peak_detected` SSE message arrives
    - [ ] Implement: Update `useRealTimeData` or create `usePeaksData` to listen for new peaks
- [ ] Task: Conductor - User Manual Verification 'Frontend Peak Analysis Page' (Protocol in workflow.md)
