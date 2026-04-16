# MCGI Power Logger

MCGI Power Logger is a centralized web-based dashboard for monitoring and analyzing power consumption data from Schneider PM5310 meters. It provides real-time visibility into Voltage, Current (Amps), and comprehensive Power metrics (Active, Reactive, Apparent Power, and Power Factor), enabling facility operators and energy managers to track usage trends and optimize energy efficiency.

## 🚀 Features

- **Real-time Monitoring**: Instant access to critical electrical parameters with 1-second precision via SSE.
- **Historical Analysis**: Long-term data logging in TimescaleDB for high-performance trend analysis.
- **Interactive Dashboard**: Device cards with live-updating metrics and interactive historical charts.
- **Peak Monitoring**: Tracking of all-time maximum values for every device and metric.
- **Custom Reports**: On-demand and scheduled generation of detailed reports in PDF and Excel formats.
- **Role-Based Access Control**: Secure JWT authentication with Admin, Operator, and Viewer roles.
- **Modern UI**: Fully responsive interface built with React, Refine, and Ant Design, featuring Dark Mode support.
- **Dockerized**: Entire stack (Frontend, Backend, Database) is containerized for easy deployment.

## 🛠️ Tech Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [TimescaleDB](https://www.timescale.com/) (PostgreSQL-based time-series DB)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Communication**: [modbus-serial](https://github.com/yaacov/node-modbus-serial) for Modbus TCP
- **Authentication**: Passport.js with JWT

### Frontend
- **Framework**: [React](https://reactjs.org/) (with TypeScript)
- **Framework Core**: [Refine](https://refine.dev/)
- **UI Components**: [Ant Design](https://ant.design/)
- **Charts**: [Ant Design Plots](https://ant-design-charts.antgroup.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)

## 📋 System Architecture

1. **Devices**: 6x Schneider PM5310 Power Meters (Modbus IDs 10, 20, 30, 40, 50, 60).
2. **Gateway**: Schneider PAS600 (Modbus TCP at 172.16.0.80).
3. **Backend**: Polls the PAS600 every second, saves data to TimescaleDB, and pushes real-time updates via Server-Sent Events (SSE).
4. **Frontend**: Displays real-time metrics and provides tools for historical trend analysis and reporting.

## ⚙️ Setup & Installation

### Prerequisites
- Docker and Docker Compose installed on your system.

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/spyshow/power-meter.git
   cd power-meter
   ```

2. Configure environment variables (optional, defaults are provided):
   - Create a `.env` file in the root based on `.env.example`.
   - Ensure `PAS600_IP` matches your gateway's IP address.

3. Start the application using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

4. Access the application:
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:3001

### Simulation Mode
If you don't have access to actual hardware, you can run the application in simulation mode by setting `MODBUS_SIMULATION=true` in the environment or using `PAS600_IP=SIMULATE`.

## 📖 Development

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📄 License
This project is licensed under the UNLICENSED license.
