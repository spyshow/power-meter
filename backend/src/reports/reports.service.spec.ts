import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

// Mock InfluxDB
jest.mock('@influxdata/influxdb-client', () => {
  return {
    InfluxDB: jest.fn().mockImplementation(() => ({
      getQueryApi: jest.fn().mockReturnValue({
        queryRows: jest.fn().mockImplementation((query, callbacks) => {
          callbacks.next({}, { toObject: () => ({ _time: '2026-03-02T12:00:00Z', device_id: '1000', kva: 1.5 }) });
          callbacks.complete();
        }),
      }),
    })),
  };
});

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
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReportData', () => {
    it('should return aggregated data from InfluxDB', async () => {
      const data = await service.getReportData({
        deviceIds: ['1000'],
        metrics: ['kva'],
        range: '1h',
        granularity: 'aggregated',
      });
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty('kva', 1.5);
    });
  });

  describe('generateExcel', () => {
    it('should generate an excel file and return the path', async () => {
      const mockData = [{ device_id: '1000', kva: 1.5 }];
      const filePath = await service.generateExcel(mockData, 'test-excel');
      expect(fs.existsSync(filePath)).toBe(true);
      expect(filePath).toContain('test-excel.xlsx');
      fs.unlinkSync(filePath);
    });
  });

  describe('generatePDF', () => {
    it('should generate a PDF file and return the path', async () => {
      const mockData = [{ _time: '2026-03-02T12:00:00Z', device_id: '1000', kva: 1.5 }];
      const filePath = await service.generatePDF(mockData, 'test-pdf');
      expect(fs.existsSync(filePath)).toBe(true);
      expect(filePath).toContain('test-pdf.pdf');
      fs.unlinkSync(filePath);
    }, 20000);
  });
});
