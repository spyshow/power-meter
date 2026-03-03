import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SubscriptionsRepository } from './subscriptions.repository';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

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
        {
          provide: SubscriptionsRepository,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('preview', () => {
    it('should return report data for preview', async () => {
      const dto = {
        deviceIds: ['10'],
        metrics: ['kva'],
        range: '1h',
        granularity: 'aggregated' as const,
      };
      const mockData = [{ timestamp: new Date(), device_id: 10, kva: 1.5 }];
      jest.spyOn(service, 'getReportData').mockResolvedValue(mockData);

      const result = await controller.preview(dto);
      expect(result).toBe(mockData);
    });
  });
});
