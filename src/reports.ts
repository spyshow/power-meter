import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

export const generateExcel = async (data: any[], fileName: string): Promise<string> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report Data');

  if (data.length > 0) {
    const columns = Object.keys(data[0]).map(key => ({
      header: key,
      key: key,
      width: 20
    }));
    worksheet.columns = columns;
    worksheet.addRows(data);
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

  // Create a simple HTML table for the report
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
        <style>
          table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          h1 { text-align: center; font-family: sans-serif; }
        </style>
      </head>
      <body>
        <h1>Power Logger Report: ${fileName}</h1>
        <table>
          ${tableHeaders}
          ${tableRows}
        </table>
      </body>
    </html>
  `;

  await page.setContent(html);
  
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filePath = path.join(reportsDir, `${fileName}.pdf`);
  
  await page.pdf({ path: filePath, format: 'A4', margin: { top: '20px', bottom: '20px' } });

  await browser.close();
  return filePath;
};
