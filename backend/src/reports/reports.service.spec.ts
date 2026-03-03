import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE_PROVIDER } from '../database/constants';
import * as fs from 'fs';

// Mock InfluxDB (if any remains) or just the DB execute
const mockDb = {
  execute: jest.fn().mockResolvedValue({
    rows: [{ device_id: 10, timestamp: new Date(), kva: 1.5, voltage: 230, current: 5 }]
  }),
};

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'INFLUXDB_URL') return 'http://localhost:8086';
              if (key === 'INFLUXDB_TOKEN') return 'test-token';
              return 'test-value';
            }),
          },
        },
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDb,
        }
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReportData', () => {
    it('should return aggregated data', async () => {
      const data = await service.getReportData({
        deviceIds: ['10'],
        metrics: ['kva'],
        range: '1h',
        granularity: 'aggregated',
      });
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('generateExcel', () => {
    it('should generate an excel file and return the path', async () => {
      const mockData = [{ timestamp: new Date().toISOString(), device_id: 10, kva: 1.5 }];
      const filePath = await service.generateExcel(mockData, 'test-excel');
      expect(fs.existsSync(filePath)).toBe(true);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
  });

  describe('generatePDF', () => {
    it('should generate a PDF file and return the path', async () => {
      const mockData = [{ timestamp: new Date().toISOString(), device_id: 10, kva: 1.5 }];
      const filePath = await service.generatePDF(mockData, 'test-pdf');
      expect(fs.existsSync(filePath)).toBe(true);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, 30000);
  });
});
