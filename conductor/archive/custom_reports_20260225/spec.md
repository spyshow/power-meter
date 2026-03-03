# Specification: Custom Report Generation & Export

## Overview
This track implements a robust reporting system for the MCGI Power Logger. Users will be able to generate, view, and export detailed performance reports for specific devices and metrics over custom or predefined time ranges. The system will support PDF and Excel exports, automated scheduling (subscriptions), and a persistent archive of past reports saved to the host machine.

## Functional Requirements
1.  **Report Configuration Page**:
    *   **Device Selection**: Multi-select for devices (1000, 2000, 3000, 4000, 5000, 6000).
    *   **Metric Selection**: Choose items to include (Amps, Voltage, kVA).
    *   **Time Selection**:
        *   Predefined ranges: 15m, 1h, 6h, 24h, 6d.
        *   Custom range: User-defined "From" and "To" date/time picker (Calendar field).
    *   **Granularity Selection**: Option to choose between Raw (1s) data or Aggregated (Min/Max/Avg) data.
2.  **Report Content**:
    *   **Summary Dashboard**: High-level section showing total consumption and peak values.
    *   **Trend Chart**: A visual line chart showing the telemetry over the selected period.
    *   **Data Table**: A chronological table listing the dates and values for selected metrics.
3.  **Export & Storage (Backend-Driven)**:
    *   **PDF Export**: High-quality PDF generation using Puppeteer (Headless Chrome), including charts and summaries.
    *   **Excel Export**: Downloadable `.xlsx` file containing tabular data (Multi-sheet structure: one device per sheet).
    *   **Local Archive**: Automatically save generated reports to a `/reports` directory in the Docker container (mapped to a host volume).
4.  **Scheduled Subscriptions**:
    *   Interface to "subscribe" to a report configuration.
    *   **Scheduling**: Standard intervals (Hourly, Daily, etc.), specific Calendar dates/times, or Cron expressions.
    *   Automated background generation and saving to the local hard drive.
5.  **Report History**:
    *   A view to list, browse, and download previously generated reports from the local storage.

## Non-Functional Requirements
*   **Performance**: Backend should handle large data queries from InfluxDB efficiently (especially for raw data exports).
*   **Portability**: Puppeteer must be configured to run in the Alpine/Debian Docker environment.
*   **Reliability**: Ensure cron jobs persist across container restarts.

## Acceptance Criteria
*   Users can configure and download a PDF/XLSX instantly.
*   Scheduled tasks correctly generate files at the specified intervals.
*   Generated files appear in the mapped host directory.
*   PDF reports contain charts and summaries as specified.
*   Excel reports are structured with one sheet per device.

## Out of Scope
*   Email delivery (SMTP) - focusing on local file system storage for now.
*   User-specific permissions for reports.
