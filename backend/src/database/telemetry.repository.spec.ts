import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryRepository } from './telemetry.repository';
import { DRIZZLE_PROVIDER } from './constants';

describe('TelemetryRepository', () => {
  let repository: TelemetryRepository;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryRepository,
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<TelemetryRepository>(TelemetryRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should insert telemetry data with all 6 metrics', async () => {
    const data = {
      deviceId: 10,
      voltage: 230.5,
      current: 5.2,
      activePower: 1.1,
      reactivePower: 0.5,
      apparentPower: 1.2,
      powerFactor: 0.95,
    };

    await repository.create(data);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining(data));
  });

  it('should query latest telemetry for a device', async () => {
    const deviceId = 10;
    mockDb.limit.mockResolvedValue([{ deviceId, voltage: 230 }]);

    const result = await repository.getLatest(deviceId);

    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.from).toHaveBeenCalled();
    expect(mockDb.where).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should query history for a device', async () => {
    const deviceId = 10;
    const startTime = new Date();
    mockDb.orderBy.mockResolvedValue([{ deviceId, voltage: 230 }]);

    const result = await repository.getHistory(deviceId, startTime);

    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.from).toHaveBeenCalled();
    expect(mockDb.where).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
