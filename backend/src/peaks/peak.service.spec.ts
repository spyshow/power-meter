import { Test, TestingModule } from '@nestjs/testing';
import { PeakService } from './peak.service';
import { DRIZZLE_PROVIDER } from '../database/database.module';

describe('PeakService', () => {
  let service: PeakService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeakService,
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<PeakService>(PeakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should detect and store a new peak', async () => {
    const deviceId = 10;
    const metric = 'voltage';
    const value = 230.5;

    await service.checkPeak(deviceId, metric, value);

    expect(service.getMax(deviceId, metric)).toBe(value);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should NOT update peak if value is lower', async () => {
    const deviceId = 10;
    const metric = 'voltage';
    
    await service.checkPeak(deviceId, metric, 230.5);
    mockDb.insert.mockClear();

    await service.checkPeak(deviceId, metric, 220.0);
    expect(service.getMax(deviceId, metric)).toBe(230.5);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});
