import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getReportData: jest.fn(),
            generateExcel: jest.fn(),
            generatePDF: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('preview', () => {
    it('should return report data for preview', async () => {
      const dto = {
        deviceIds: ['1000'],
        metrics: ['kva'],
        range: '1h',
        granularity: 'aggregated' as const,
      };
      const mockData = [{ _time: '2026-03-02T12:00:00Z', device_id: '1000', kva: 1.5 }];
      jest.spyOn(service, 'getReportData').mockResolvedValue(mockData);

      const result = await controller.preview(dto);
      expect(result).toBe(mockData);
      expect(service.getReportData).toHaveBeenCalledWith(dto);
    });
  });

  describe('download', () => {
    it('should trigger excel generation and return a stream', async () => {
      const dto = {
        deviceIds: ['1000'],
        metrics: ['kva'],
        range: '1h',
        granularity: 'aggregated' as const,
        format: 'xlsx' as const,
      };
      const mockPath = '/app/reports/report.xlsx';
      jest.spyOn(service, 'getReportData').mockResolvedValue([]);
      jest.spyOn(service, 'generateExcel').mockResolvedValue(mockPath);

      // We'll mock the response object in the actual implementation test
      // but here we just check service calls.
      const res = {
        download: jest.fn(),
      };
      
      await controller.download(dto, res as any);
      expect(service.generateExcel).toHaveBeenCalled();
      expect(res.download).toHaveBeenCalledWith(mockPath);
    });
  });
});
