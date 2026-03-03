import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../database/constants';
import { telemetry } from '../database/schema';
import { sql } from 'drizzle-orm';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';

export interface ReportParams {
  deviceIds: string[];
  metrics: string[];
  range?: string; // e.g. '1h', '6h', '24h', '6d'
  start?: string; // ISO string
  stop?: string;  // ISO string
  granularity: 'raw' | 'aggregated';
}

@Injectable()
export class ReportsService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async getReportData(params: ReportParams): Promise<any[]> {
    let startTime: Date;
    let endTime: Date = params.stop ? new Date(params.stop) : new Date();

    if (params.start) {
      startTime = new Date(params.start);
    } else if (params.range) {
      const match = params.range.match(/^(\d+)([mhdw])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        startTime = new Date(endTime);
        if (unit === 'm') startTime.setMinutes(endTime.getMinutes() - value);
        else if (unit === 'h') startTime.setHours(endTime.getHours() - value);
        else if (unit === 'd') startTime.setDate(endTime.getDate() - value);
        else if (unit === 'w') startTime.setDate(endTime.getDate() - value * 7);
      } else {
        startTime = new Date(endTime.getTime() - 3600000); // 1h default
      }
    } else {
      startTime = new Date(endTime.getTime() - 3600000); // 1h default
    }

    const deviceIds = params.deviceIds.map(id => parseInt(id));
    const metrics = params.metrics; // voltage, current, kva
    
    const startStr = startTime.toISOString();
    const endStr = endTime.toISOString();

    if (params.granularity === 'raw') {
      const selectMetrics = metrics.map(m => `ROUND(CAST(${m} AS numeric), 2) as ${m}`).join(', ');
      
      const query = sql`
        WITH raw_data AS (
          SELECT 
            device_id, 
            timestamp, 
            ${sql.raw(metrics.join(', '))},
            LAG(kva) OVER (PARTITION BY device_id ORDER BY timestamp) as prev_kva
          FROM telemetry
          WHERE device_id IN (${sql.join(deviceIds, sql`, `)})
            AND timestamp >= ${startStr}
            AND timestamp <= ${endStr}
        )
        SELECT 
          device_id,
          timestamp,
          ${sql.raw(metrics.map(m => `ROUND(CAST(${m} AS numeric), 2) as ${m}`).join(', '))},
          ROUND(CAST(prev_kva AS numeric), 2) as previous_value,
          ROUND(CAST(CASE WHEN prev_kva > 0 THEN ((kva - prev_kva) / prev_kva) * 100 ELSE 0 END AS numeric), 2) as increase_percent
        FROM raw_data
        ORDER BY timestamp ASC
      `;
      const result = await this.db.execute(query);
      return result.rows || result;
    } else {
      // Aggregated (TimeScaleDB time_bucket)
      let interval = '1 minute';
      if (params.range === '6d') interval = '1 hour';
      else if (params.range === '24h') interval = '10 minutes';
      else if (params.range === '6h') interval = '5 minutes';

      const binnedMetrics = metrics.filter(m => m !== 'kva').map(m => `AVG(${m}) as avg_${m}`);
      const binnedSelect = ['AVG(kva) as avg_kva', ...binnedMetrics].join(', ');

      const selectMetrics = metrics.filter(m => m !== 'kva').map(m => `ROUND(CAST(avg_${m} AS numeric), 2) as ${m}`);
      const finalSelect = ['ROUND(CAST(avg_kva AS numeric), 2) as kva', ...selectMetrics].join(', ');

      const query = sql`
        WITH binned AS (
          SELECT 
            device_id,
            time_bucket(${sql.raw(`'${interval}'`)}, timestamp) AS bucket_time,
            ${sql.raw(binnedSelect)}
          FROM telemetry
          WHERE device_id IN (${sql.join(deviceIds, sql`, `)})
            AND timestamp >= ${startStr}
            AND timestamp <= ${endStr}
          GROUP BY device_id, bucket_time
        ),
        with_prev AS (
          SELECT 
            *,
            LAG(avg_kva) OVER (PARTITION BY device_id ORDER BY bucket_time) as prev_avg_kva
          FROM binned
        )
        SELECT 
          device_id,
          bucket_time as timestamp,
          ${sql.raw(finalSelect)},
          ROUND(CAST(prev_avg_kva AS numeric), 2) as previous_value,
          ROUND(CAST(CASE WHEN prev_avg_kva > 0 THEN ((avg_kva - prev_avg_kva) / prev_avg_kva) * 100 ELSE 0 END AS numeric), 2) as increase_percent
        FROM with_prev
        ORDER BY timestamp ASC
      `;
      const result = await this.db.execute(query);
      return result.rows || result;
    }
  }

  private roundData(data: any[]): any[] {
    // Rounding now handled in SQL, but keeping as a safety net
    return data.map((row: any) => {
      const newRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        if (['device_id', 'deviceId', 'id', 'timestamp', 'bucket_time', '_time'].includes(key)) {
          newRow[key] = value;
          continue;
        }
        const num = parseFloat(value as string);
        if (!isNaN(num)) {
          newRow[key] = Number(num.toFixed(2));
        } else {
          newRow[key] = value;
        }
      }
      return newRow;
    });
  }

  async generateExcel(data: any[], fileName: string): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const devices = [...new Set(data.map((item) => item.device_id || item.deviceId || 'Unknown'))];

    // 1. Create Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Device ID', key: 'deviceId', width: 15 },
      { header: 'Data Points', key: 'count', width: 15 },
      { header: 'Max kVA', key: 'maxKva', width: 15 },
      { header: 'Avg kVA', key: 'avgKva', width: 15 },
    ];

    summarySheet.getRow(1).font = { bold: true };

    const summaryData = devices.map((deviceId) => {
      const deviceData = data.filter((item) => (item.device_id || item.deviceId || 'Unknown') === deviceId);
      const kvaValues = deviceData.map((d) => Number(d.kva) || 0).filter((v) => v > 0);
      return {
        deviceId,
        count: deviceData.length,
        avgKva: kvaValues.length ? (kvaValues.reduce((a, b) => a + b, 0) / kvaValues.length).toFixed(2) : 'N/A',
        maxKva: kvaValues.length ? Math.max(...kvaValues).toFixed(2) : 'N/A',
      };
    });

    summarySheet.addRows(summaryData);

    // 2. Generate Chart using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    try {
      const page = await browser.newPage();

      const chartLabels = [...new Set(data.map((d) => new Date(d.timestamp).toISOString()))].sort();
      const datasets = devices.map((deviceId, index) => {
        const colors = ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'];
        return {
          label: `Device ${deviceId} (kVA)`,
          data: chartLabels.map((time) => {
            const item = data.find((d) => new Date(d.timestamp).toISOString() === time && (d.device_id || d.deviceId || 'Unknown') === deviceId);
            return item ? Number(item.kva) || 0 : null;
          }),
          borderColor: colors[index % colors.length],
          fill: false,
        };
      });

      await page.setContent(`
        <html>
          <head><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head>
          <body>
            <div style="width: 800px; height: 400px;"><canvas id="myChart"></canvas></div>
            <script>
              const ctx = document.getElementById('myChart').getContext('2d');
              new Chart(ctx, {
                type: 'line',
                data: {
                  labels: ${JSON.stringify(chartLabels)},
                  datasets: ${JSON.stringify(datasets)}
                },
                options: {
                  devicePixelRatio: 2,
                  animation: false,
                  scales: { y: { beginAtZero: true } }
                }
              });
            </script>
          </body>
        </html>
      `);

      await page.waitForNetworkIdle();
      const chartBuffer = await page.screenshot({ clip: { x: 0, y: 0, width: 800, height: 400 } });

      const imageId = workbook.addImage({
        buffer: Buffer.from(chartBuffer) as any,
        extension: 'png',
      });

      summarySheet.addImage(imageId, {
        tl: { col: 5, row: 1 },
        ext: { width: 600, height: 300 }
      });
    } finally {
      await browser.close();
    }

    // 3. Create Device Sheets
    if (data.length > 0) {
      for (const deviceId of devices) {
        const deviceData = data.filter((item) => (item.device_id || item.deviceId || 'Unknown') === deviceId);
        const sheetName = `Device ${deviceId}`.substring(0, 31);
        const worksheet = workbook.addWorksheet(sheetName);

        const columns = Object.keys(deviceData[0]).map((key) => ({
          header: key.toUpperCase(),
          key: key,
          width: 20,
        }));
        worksheet.columns = columns;
        worksheet.getRow(1).font = { bold: true };
        worksheet.addRows(deviceData);
      }
    } else {
      workbook.addWorksheet('Empty Report');
    }

    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, `${fileName}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  async generatePDF(data: any[], fileName: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    try {
      const page = await browser.newPage();

      const devices = [...new Set(data.map((item) => item.device_id || item.deviceId || 'Unknown'))];
      const summary = devices.map((deviceId) => {
        const deviceData = data.filter((item) => (item.device_id || item.deviceId || 'Unknown') === deviceId);
        const kvaValues = deviceData.map((d) => Number(d.kva) || 0).filter((v) => v > 0);
        return {
          deviceId,
          count: deviceData.length,
          avgKva: kvaValues.length ? (kvaValues.reduce((a, b) => a + b, 0) / kvaValues.length).toFixed(2) : 'N/A',
          maxKva: kvaValues.length ? Math.max(...kvaValues).toFixed(2) : 'N/A',
        };
      });

      const chartLabels = [...new Set(data.map((d) => new Date(d.timestamp).toISOString()))].sort();
      const datasets = devices.map((deviceId, index) => {
        const colors = ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'];
        return {
          label: `Device ${deviceId} (kVA)`,
          data: chartLabels.map((time) => {
            const item = data.find((d) => new Date(d.timestamp).toISOString() === time && (d.device_id || d.deviceId || 'Unknown') === deviceId);
            return item ? Number(item.kva) || 0 : null;
          }),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
          fill: false,
          tension: 0.1,
        };
      });

      const tableRows = data.map((row) => `
        <tr>
          ${Object.values(row).map((val) => `<td>${val}</td>`).join('')}
        </tr>
      `).join('');

      const tableHeaders = data.length > 0 ? `
        <tr>
          ${Object.keys(data[0]).map((key) => `<th>${key}</th>`).join('')}
        </tr>
      ` : '';

      const html = `
        <html>
          <head>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; }
              h1 { text-align: center; color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
              .summary-container { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; justify-content: center; }
              .summary-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; min-width: 150px; background: #f9f9f9; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              .summary-card h3 { margin-top: 0; color: #34495e; font-size: 14px; text-transform: uppercase; }
              .summary-card p { margin: 5px 0; font-size: 18px; font-weight: bold; color: #2980b9; }
              .chart-container { width: 100%; height: 400px; margin-bottom: 40px; }
              table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; }
              th, td { border: 1px solid #eee; padding: 6px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
              th { background-color: #f4f7f6; color: #666; font-weight: 600; }
              tr:nth-child(even) { background-color: #fafafa; }
              .page-break { page-break-before: always; }
            </style>
          </head>
          <body>
            <h1>MCGI Power Logger: Performance Report</h1>
            <p style="text-align: center; color: #7f8c8d;">Generated on ${new Date().toLocaleString()} | File: ${fileName}</p>
            
            <div class="summary-container">
              ${summary.map((s) => `
                <div class="summary-card">
                  <h3>Device ${s.deviceId}</h3>
                  <p>Max: ${s.maxKva} kVA</p>
                  <p>Avg: ${s.avgKva} kVA</p>
                  <span style="font-size: 11px; color: #95a5a6;">Points: ${s.count}</span>
                </div>
              `).join('')}
            </div>

            <div class="chart-container">
              <canvas id="trendChart"></canvas>
            </div>

            <script>
              const ctx = document.getElementById('trendChart').getContext('2d');
              new Chart(ctx, {
                type: 'line',
                data: {
                  labels: ${JSON.stringify(chartLabels)},
                  datasets: ${JSON.stringify(datasets)}
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: { display: true, text: 'Power Consumption Trend (kVA)' },
                    legend: { position: 'bottom' }
                  },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'kVA' } },
                    x: { ticks: { maxRotation: 45, minRotation: 45, font: { size: 8 } } }
                  },
                  animation: false
                }
              });
            </script>

            <div class="page-break"></div>
            <h2>Detailed Telemetry Data</h2>
            <table>
              ${tableHeaders}
              ${tableRows}
            </table>
          </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const filePath = path.join(reportsDir, `${fileName}.pdf`);

      await page.pdf({
        path: filePath,
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '10mm', right: '10mm' },
        printBackground: true,
      });

      return filePath;
    } finally {
      await browser.close();
    }
  }
}
