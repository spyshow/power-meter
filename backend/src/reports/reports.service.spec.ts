import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE_PROVIDER } from '../database/constants';
import * as fs from 'fs';

const mockDb = {
  execute: jest.fn().mockResolvedValue({
    rows: [{ 
      device_id: 10, 
      timestamp: new Date(), 
      voltage: 230, 
      current: 5,
      activePower: 1.1,
      reactivePower: 0.5,
      apparentPower: 1.2,
      powerFactor: 0.95
    }]
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
            get: jest.fn((key: string) => 'test-value'),
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
    it('should return aggregated data with 6 metrics', async () => {
      const data = await service.getReportData({
        deviceIds: ['10'],
        metrics: ['voltage', 'current', 'activePower', 'reactivePower', 'apparentPower', 'powerFactor'],
        range: '1h',
        granularity: 'aggregated',
      });
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty('activePower');
    });
  });

  describe('generateExcel', () => {
    it('should generate an excel file with 6 metrics and return the path', async () => {
      const mockData = [{ 
        timestamp: new Date().toISOString(), 
        device_id: 10, 
        voltage: 230, 
        current: 5,
        activePower: 1.1,
        reactivePower: 0.5,
        apparentPower: 1.2,
        powerFactor: 0.95
      }];
      const filePath = await service.generateExcel(mockData, 'test-excel');
      expect(fs.existsSync(filePath)).toBe(true);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, 30000);
  });

  describe('generatePDF', () => {
    it('should generate a PDF file with 6 metrics and return the path', async () => {
      const mockData = [{ 
        timestamp: new Date().toISOString(), 
        device_id: 10, 
        voltage: 230, 
        current: 5,
        activePower: 1.1,
        reactivePower: 0.5,
        apparentPower: 1.2,
        powerFactor: 0.95
      }];
      const filePath = await service.generatePDF(mockData, 'test-pdf');
      expect(fs.existsSync(filePath)).toBe(true);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, 30000);
  });
});
