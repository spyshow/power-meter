# Specification: Custom Report Generation & Export

## Overview
This track implements a robust reporting system for the MCGI Power Logger. Users will be able to generate, view, and export detailed performance reports for specific devices and metrics over custom or predefined time ranges. The system will support PDF and Excel exports, automated scheduling (subscriptions), and a persistent archive of past reports.

## Functional Requirements
1.  **Report Configuration Page**:
    *   **Device Selection**: Multi-select or single select for devices (1000, 2000, 3000, 4000, 5000, 6000).
    *   **Metric Selection**: Choose items to include (Amps, Voltage, kVA).
    *   **Time Selection**:
        *   Predefined ranges: 15m, 1h, 6h, 24h, 6d.
        *   Custom range: User-defined "From" and "To" date/time picker.
    *   **Granularity Selection**: Option to choose between Raw (1s) data or Aggregated (Min/Max/Avg) data.
2.  **Report Content**:
    *   **Trend Chart**: A visual line chart showing the telemetry over the selected period.
    *   **Data Table**: A chronological table listing the dates and values for selected metrics.
3.  **Export & Storage (Backend-Driven)**:
    *   **PDF Export**: High-quality PDF generation using Puppeteer (rendering the dashboard view).
    *   **Excel Export**: Downloadable `.xlsx` file containing the tabular data.
    *   **Local Archive**: Automatically save generated reports to a `reports/` directory in the local file system.
4.  **Scheduled Subscriptions**:
    *   Interface to "subscribe" to a report, triggering automated generation and saving at scheduled intervals.
5.  **Report History**:
    *   A view to list, browse, and download previously generated reports from the local storage.

## Non-Functional Requirements
*   **Performance**: Backend should handle large data queries from InfluxDB efficiently (especially for raw data exports).
*   **Security**: Ensure the local `reports/` folder is protected and only accessible via the application.
*   **Portability**: PDF generation should work consistently across environments (Docker support for Puppeteer).

## Acceptance Criteria
*   [ ] User can configure and view a report in the browser.
*   [ ] User can successfully download a PDF version of the report with charts and tables.
*   [ ] User can successfully download an Excel (.xlsx) version of the report.
*   [ ] Generated reports are saved correctly in the backend's local file system.
*   [ ] Past reports can be retrieved and downloaded from a history page.

## Out of Scope
*   Email delivery (SMTP) - focusing on local file system storage for now.
*   User-specific permissions for reports (all users see all reports).
