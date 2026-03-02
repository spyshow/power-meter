import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

export const generateExcel = async (data: any[], fileName: string): Promise<string> => {
  const workbook = new ExcelJS.Workbook();

  if (data.length > 0) {
    // Group data by device_id
    const devices = [...new Set(data.map(item => item.device_id || 'Unknown'))];

    for (const deviceId of devices) {
      const deviceData = data.filter(item => (item.device_id || 'Unknown') === deviceId);
      const sheetName = `Device ${deviceId}`.substring(0, 31); // Excel sheet name limit
      const worksheet = workbook.addWorksheet(sheetName);

      const columns = Object.keys(deviceData[0]).map(key => ({
        header: key,
        key: key,
        width: 20
      }));
      worksheet.columns = columns;
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
};

export const generatePDF = async (data: any[], fileName: string): Promise<string> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Calculate Summary Statistics
  const devices = [...new Set(data.map(item => item.device_id || 'Unknown'))];
  const summary = devices.map(deviceId => {
    const deviceData = data.filter(item => (item.device_id || 'Unknown') === deviceId);
    const kvaValues = deviceData.map(d => Number(d.kva) || 0).filter(v => v > 0);
    return {
      deviceId,
      count: deviceData.length,
      avgKva: kvaValues.length ? (kvaValues.reduce((a, b) => a + b, 0) / kvaValues.length).toFixed(2) : 'N/A',
      maxKva: kvaValues.length ? Math.max(...kvaValues).toFixed(2) : 'N/A'
    };
  });

  // Prepare Chart Data (Aggregated by time for the chart)
  const chartLabels = [...new Set(data.map(d => d._time))].sort();
  const datasets = devices.map((deviceId, index) => {
    const colors = ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'];
    return {
      label: `Device ${deviceId} (kVA)`,
      data: chartLabels.map(time => {
        const item = data.find(d => d._time === time && (d.device_id || 'Unknown') === deviceId);
        return item ? Number(item.kva) || 0 : null;
      }),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
      fill: false,
      tension: 0.1
    };
  });

  // Create HTML table
  const tableRows = data.map(row => `
    <tr>
      ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
    </tr>
  `).join('');

  const tableHeaders = data.length > 0 ? `
    <tr>
      ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
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
          .summary-card p { margin: 5px 0; font-size: 18px; fontWeight: bold; color: #2980b9; }
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
          ${summary.map(s => `
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
    printBackground: true
  });

  await browser.close();
  return filePath;
};
