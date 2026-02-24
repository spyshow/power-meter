# Initial Concept

i have 6 schnieder PM5310 connected via modbus to PAS600 and i am connected to the PAS600 via ethernet(ip:172.16.0.80)(the PM5310 devices names are : 1000,2000,3000,4000,5000,6000 and there modbus ID are :10,20,30,40,50,60) . i want to make a dashboard to read the voltage , KVA, and amps every second from them and record it in database (sqlite) and i can show trends for different valuse and devices

# Product Guide: MCGI Power Logger

## Vision
A centralized web-based dashboard for monitoring and analyzing power consumption data from Schneider PM5310 meters. By providing real-time visibility into Voltage, Power (kVA), and Current (Amps), facility operators and energy managers can track usage trends and optimize energy efficiency.

## Target Audience
- **Facility Operators:** Monitor real-time consumption and ensure stable power supply.
- **Energy Managers:** Analyze historical usage trends for cost optimization and planning.

## Core Value Proposition
- **Real-time Monitoring:** Instant access to critical electrical parameters from multiple devices with 1-second precision.
- **Historical Analysis:** Long-term data logging in InfluxDB enables high-performance trend analysis and pattern recognition.
- **Simple Integration:** Seamless connectivity with Schneider PM5310 meters via Modbus TCP (PAS600 gateway).

## Key Features
- **Device Dashboard:** Real-time display of Voltage, Current, and Power for 6 specific PM5310 devices.
- **Data Logging:** Continuous recording of sensor data to a local InfluxDB instance at 1-second intervals.
- **Telemetry Trends:** Interactive, live-updating charts to visualize historical data with dynamic aggregation for performance.
- **Peak Value Monitoring:** Dedicated analysis page tracking all-time maximum values for every device and metric with real-time updates.
- **Theme Support:** Fully responsive UI with integrated Dark Mode support.

## Technical Context
- **Protocol:** Modbus TCP (via PAS600 Gateway at 172.16.0.80).
- **Database:** InfluxDB for time-series sensor data.
- **Platform:** Web Application accessible via standard browsers.
- **Devices:**
    - Device 1000 (ID 10)
    - Device 2000 (ID 20)
    - Device 3000 (ID 30)
    - Device 4000 (ID 40)
    - Device 5000 (ID 50)
    - Device 6000 (ID 60)
