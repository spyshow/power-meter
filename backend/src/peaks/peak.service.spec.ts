import { Test, TestingModule } from '@nestjs/testing';
import { PeakService } from './peak.service';
import { DRIZZLE_PROVIDER } from '../database/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PeakService', () => {
  let service: PeakService;
  let mockDb: any;
  let mockEventEmitter: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeakService,
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDb,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PeakService>(PeakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should detect and store a new peak for voltage', async () => {
    const deviceId = 10;
    const metric = 'voltage';
    const value = 230.5;

    await service.checkPeak(deviceId, metric, value);

    expect(service.getMax(deviceId, metric)).toBe(value);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should detect and store a new peak for activePower', async () => {
    const deviceId = 10;
    const metric = 'activePower';
    const value = 1.5;

    await service.checkPeak(deviceId, metric, value);

    expect(service.getMax(deviceId, metric)).toBe(value);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should detect and store a new peak for reactivePower', async () => {
    const deviceId = 10;
    const metric = 'reactivePower';
    const value = 0.8;

    await service.checkPeak(deviceId, metric, value);

    expect(service.getMax(deviceId, metric)).toBe(value);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should detect and store a new peak for apparentPower', async () => {
    const deviceId = 10;
    const metric = 'apparentPower';
    const value = 1.7;

    await service.checkPeak(deviceId, metric, value);

    expect(service.getMax(deviceId, metric)).toBe(value);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should detect and store a new peak for powerFactor', async () => {
    const deviceId = 10;
    const metric = 'powerFactor';
    const value = 0.98;

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
