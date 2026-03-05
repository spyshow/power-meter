import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryRepository } from './telemetry.repository';
import { DRIZZLE_PROVIDER } from './constants';

describe('TelemetryRepository', () => {
  let repository: TelemetryRepository;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      execute: jest.fn(),
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

    mockDb.execute.mockResolvedValue({ rows: [] });

    await repository.create(data);

    expect(mockDb.execute).toHaveBeenCalled();
  });

  it('should query latest telemetry for a device', async () => {
    const deviceId = 10;
    mockDb.execute.mockResolvedValue({ rows: [{ device_id: deviceId, voltage: 230 }] });

    const result = await repository.getLatest(deviceId);

    expect(mockDb.execute).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.device_id).toBe(deviceId);
  });

  it('should query history for a device', async () => {
    const deviceId = 10;
    const startTime = new Date();
    mockDb.execute.mockResolvedValue({ rows: [{ device_id: deviceId, voltage: 230 }] });

    const result = await repository.getHistory(deviceId, startTime);

    expect(mockDb.execute).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should query history with aggregation', async () => {
    const deviceId = 10;
    const startTime = new Date();
    const interval = '1h';
    mockDb.execute.mockResolvedValue({ rows: [{ 
      timestamp: new Date(), 
      voltage: 230, 
      current: 5, 
      active_power: 1, 
      reactive_power: 0.5, 
      apparent_power: 1.1, 
      power_factor: 0.9 
    }] });

    const result = await repository.getHistory(deviceId, startTime, interval);

    expect(mockDb.execute).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result[0]).toHaveProperty('active_power');
  });
});
