import { generateExcel } from '../src/reports';
import fs from 'fs';
import path from 'path';

describe('Excel Generation Service', () => {
  const testData = [
    { _time: '2026-02-25T10:00:00Z', device_id: '10', voltage: 230, current: 5, kva: 1.15 },
    { _time: '2026-02-25T10:01:00Z', device_id: '10', voltage: 231, current: 5.1, kva: 1.18 }
  ];

  it('should generate an excel file and return the path', async () => {
    const filePath = await generateExcel(testData, 'test_report');
    expect(fs.existsSync(filePath)).toBe(true);
    expect(filePath).toContain('test_report.xlsx');
    
    // Cleanup
    fs.unlinkSync(filePath);
  });
});
