import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryRepository } from './telemetry.repository';
import { DRIZZLE_PROVIDER } from './database.module';

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

  it('should insert telemetry data', async () => {
    const data = {
      deviceId: 10,
      voltage: 230.5,
      current: 5.2,
      kva: 1.2,
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
});
