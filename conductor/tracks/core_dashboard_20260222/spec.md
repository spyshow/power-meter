# Specification: Core Dashboard with Real-time Modbus Integration

## 1. Overview
This track focuses on building the MVP (Minimum Viable Product) of the Modbus Dashboard. The goal is to establish connectivity with 6 Schneider PM5310 power meters via a PAS600 gateway, ingest real-time electrical data (Voltage, KVA, Amps) into an InfluxDB database, and visualize this data on a web-based dashboard using Refine and Ant Design.

## 2. Functional Requirements

### 2.1 Data Ingestion (Backend)
- **Modbus Connectivity:**
  - Connect to PAS600 Gateway at IP `172.16.0.80` on port `502`.
  - Poll 6 devices with Modbus IDs: `10, 20, 30, 40, 50, 60`.
  - Polling frequency: 1 second (1Hz).
  - Protocol: Modbus TCP.
- **Data Points:**
  - Read Voltage (V_LL_avg), Current (A_avg), and Apparent Power (KVA_tot) registers for each device.
- **Storage:**
  - Write time-series data to InfluxDB.
  - Measurement: `power_consumption`.
  - Tags: `device_id` (e.g., "1000", "2000").
  - Fields: `voltage`, `current`, `kva`.
- **Reliability:**
  - Implement auto-reconnection logic for Modbus socket.
  - Buffer data in memory if InfluxDB is temporarily unreachable.

### 2.2 Dashboard (Frontend)
- **Real-time View:**
  - Display a grid of 6 "Device Cards".
  - Each card shows:
    - Device Name (e.g., "Device 1000").
    - Current Voltage, Amps, KVA values.
    - Status Indicator (Green=Online, Red=Offline).
  - Data must update automatically without page refresh (using React Query / WebSockets / Polling).
- **Historical View:**
  - Clicking a device card opens a detailed view.
  - Show trend charts for Voltage, Amps, and KVA over the last hour/day.
  - Use Ant Design Charts.

## 3. Non-Functional Requirements
- **Performance:** Dashboard updates should reflect backend state within <1 second.
- **Scalability:** System architecture should allow adding more devices in future tracks.
- **UX:** Clean, professional "Enterprise Blue" theme using Ant Design.

## 4. Acceptance Criteria
- [ ] Backend service successfully connects to PAS600 and polls all 6 devices.
- [ ] Data is verified to be flowing into InfluxDB at 1Hz.
- [ ] Frontend dashboard displays live data for all 6 devices.
- [ ] Disconnecting a device (simulated) shows "Offline" status on dashboard.
- [ ] Historical charts render correct data from InfluxDB.
