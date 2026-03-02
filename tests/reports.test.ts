import { queryReportData } from '../src/influx';
import { generateExcel, generatePDF } from '../src/reports';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

// Mock the InfluxDB client and WriteApi
jest.mock('@influxdata/influxdb-client', () => {
  const mWriteApi = {
    writePoint: jest.fn(),
    flush: jest.fn().mockResolvedValue(undefined),
  };
  const mQueryApi = {
    queryRows: jest.fn().mockImplementation((query, callbacks) => {
      // Mock some data returned from InfluxDB
      callbacks.next({}, { toObject: () => ({ _time: '2026-02-25T10:00:00Z', device_id: '10', voltage: 230, current: 5, kva: 1.15 }) });
      callbacks.complete();
    }),
  };
  return {
    InfluxDB: jest.fn().mockImplementation(() => ({
      getWriteApi: jest.fn().mockReturnValue(mWriteApi),
      getQueryApi: jest.fn().mockReturnValue(mQueryApi),
    })),
    Point: jest.fn(),
  };
});

describe('Report Data Logic', () => {
  it('should query report data with correct parameters', async () => {
    const params = {
      deviceIds: ['10', '20'],
      metrics: ['voltage', 'current'],
      range: '1h',
      granularity: 'aggregated' as const
    };

    const data = await queryReportData(params);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('voltage');
    expect(data[0]).toHaveProperty('current');
  });

  it('should support custom date ranges', async () => {
    const params = {
      deviceIds: ['10'],
      metrics: ['kva'],
      start: '2026-02-25T00:00:00Z',
      stop: '2026-02-25T23:59:59Z',
      granularity: 'raw' as const
    };

    const data = await queryReportData(params);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('Excel Generation', () => {
  const reportsDir = path.join(process.cwd(), 'reports');

  it('should generate a multi-sheet Excel file for multiple devices', async () => {
    const mockData = [
      { _time: '2026-03-02T10:00:00Z', device_id: '1000', voltage: 230 },
      { _time: '2026-03-02T10:01:00Z', device_id: '1000', voltage: 231 },
      { _time: '2026-03-02T10:00:00Z', device_id: '2000', voltage: 228 },
    ];
    const fileName = 'test-multi-sheet';
    
    const filePath = await generateExcel(mockData, fileName);
    expect(fs.existsSync(filePath)).toBe(true);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const sheetNames = workbook.worksheets.map(ws => ws.name);
    expect(sheetNames).toContain('Device 1000');
    expect(sheetNames).toContain('Device 2000');
    expect(sheetNames).not.toContain('Report Data'); // Should replace the default sheet
    
    // Cleanup
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
});

describe('PDF Generation', () => {
  it('should generate a PDF file from report data', async () => {
    const mockData = [
      { _time: '2026-03-02T10:00:00Z', device_id: '1000', voltage: 230 },
    ];
    const fileName = 'test-pdf';
    
    const filePath = await generatePDF(mockData, fileName);
    expect(fs.existsSync(filePath)).toBe(true);
    
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);
    
    // Cleanup
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }, 15000); // Increase timeout for Puppeteer
});
