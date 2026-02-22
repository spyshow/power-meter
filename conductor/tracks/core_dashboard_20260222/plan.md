# Implementation Plan - Core Dashboard with Real-time Modbus Integration

## Phase 1: Environment Setup & Backend Ingestion [checkpoint: 6eff876]
- [x] Task: Project Initialization [f9e6d85]
    - [ ] Initialize Node.js project (package.json)
    - [ ] Install dependencies (NestJS/Express, InfluxDB client, modbus-serial, dotenv)
    - [ ] Configure TypeScript and ESLint/Prettier
    - [ ] Set up `.env` for PAS600 credentials and `.gitignore` to exclude it
- [x] Task: InfluxDB Setup [0f09748]
    - [ ] Set up local InfluxDB instance (Docker or local install)
    - [ ] Write Tests: Verify InfluxDB connection and bucket creation
    - [ ] Implement: Database connection module
- [x] Task: Modbus Polling Engine [a9d2f5e]
    - [ ] Write Tests: Mock Modbus device and verify polling logic
    - [ ] Implement: Modbus client wrapper (connect, read registers)
    - [ ] Implement: Polling loop (1Hz) for 6 devices
    - [ ] Implement: Data write to InfluxDB
- [x] Task: Conductor - User Manual Verification 'Environment Setup & Backend Ingestion' (Protocol in workflow.md) [6eff876]

## Phase 2: Backend API [checkpoint: b68d892]
- [x] Task: Devices Endpoint [d1b3f2e]
    - [ ] Write Tests: GET /devices returns list of 6 configured devices
    - [ ] Implement: API endpoint to serve device metadata
- [x] Task: Real-time Data Endpoint (SSE/WebSockets) [89bd8f0]
    - [ ] Write Tests: Connect to stream and receive updates
    - [ ] Implement: Server-Sent Events (SSE) or WebSocket gateway for real-time data
- [x] Task: Historical Data Endpoint [5912694]
    - [ ] Write Tests: GET /history returns timeseries data from InfluxDB
    - [ ] Implement: API endpoint to query InfluxDB with time ranges
- [x] Task: Conductor - User Manual Verification 'Backend API' (Protocol in workflow.md) [b68d892]

## Phase 3: Frontend Dashboard
- [x] Task: Refine & Ant Design Setup [51447ae]
    - [ ] Initialize Refine project
    - [ ] Configure Ant Design theme (Enterprise Blue)
- [x] Task: Device Cards Component [334175a]
    - [ ] Write Tests: Component renders correctly with mock data
    - [ ] Implement: Card component showing Voltage, Amps, KVA
    - [ ] Implement: Grid layout for 6 devices
- [ ] Task: Real-time Integration
    - [ ] Write Tests: Hook updates state on incoming data
    - [ ] Implement: Connect Frontend to Backend Real-time stream
- [ ] Task: Historical Charts
    - [ ] Write Tests: Chart component renders with mock history data
    - [ ] Implement: Modal/Page for device details with Ant Design Charts
- [ ] Task: Conductor - User Manual Verification 'Frontend Dashboard' (Protocol in workflow.md)

## Phase 4: Integration & Validation
- [ ] Task: System Integration Test
    - [ ] Write Tests: End-to-end test flow (Mock Modbus -> Backend -> DB -> API)
    - [ ] Implement: Fix any integration bugs
- [ ] Task: Reliability Hardening
    - [ ] Write Tests: Verify auto-reconnection logic when Modbus fails
    - [ ] Implement: Robust error handling and logging
- [ ] Task: Conductor - User Manual Verification 'Integration & Validation' (Protocol in workflow.md)
