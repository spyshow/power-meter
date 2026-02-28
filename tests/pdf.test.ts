import { generatePDF } from '../src/reports';
import fs from 'fs';
import path from 'path';

describe('PDF Generation Service', () => {
  const testData = [
    { _time: '2026-02-25T10:00:00Z', device_id: '10', voltage: 230, current: 5, kva: 1.15 }
  ];

  it('should generate a PDF file and return the path', async () => {
    // Increase timeout for Puppeteer
    jest.setTimeout(30000);
    
    const filePath = await generatePDF(testData, 'test_report');
    expect(fs.existsSync(filePath)).toBe(true);
    expect(filePath).toContain('test_report.pdf');
    
    // Cleanup
    fs.unlinkSync(filePath);
  });
});
