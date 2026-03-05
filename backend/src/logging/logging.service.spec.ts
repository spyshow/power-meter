import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from './logging.service';
import { ModbusService } from '../modbus/modbus.service';
import { TelemetryRepository } from '../database/telemetry.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PeakService } from '../peaks/peak.service';

describe('LoggingService', () => {
  let service: LoggingService;
  let mockModbusService: any;
  let mockTelemetryRepo: any;
  let mockEventEmitter: any;
  let mockPeakService: any;

  beforeEach(async () => {
    mockModbusService = {
      readFloat: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
    };
    mockTelemetryRepo = {
      create: jest.fn(),
    };
    mockEventEmitter = {
      emit: jest.fn(),
    };
    mockPeakService = {
      checkPeak: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingService,
        {
          provide: ModbusService,
          useValue: mockModbusService,
        },
        {
          provide: TelemetryRepository,
          useValue: mockTelemetryRepo,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: PeakService,
          useValue: mockPeakService,
        },
      ],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should poll a device and save 6-metric data', async () => {
    const deviceId = 10;
    // Current, Voltage, Active, Reactive, Apparent, PowerFactor
    mockModbusService.readFloat
      .mockResolvedValueOnce(5.2)   // Current
      .mockResolvedValueOnce(230.5) // Voltage
      .mockResolvedValueOnce(1.1)   // Active
      .mockResolvedValueOnce(0.5)   // Reactive
      .mockResolvedValueOnce(1.2)   // Apparent
      .mockResolvedValueOnce(0.95); // PowerFactor

    await service.pollDevice(deviceId);

    expect(mockModbusService.readFloat).toHaveBeenCalledTimes(6);
    
    // Verify 1-based registers (subtracted 1) are used
    expect(mockModbusService.readFloat).toHaveBeenCalledWith(deviceId, 3009);
    expect(mockModbusService.readFloat).toHaveBeenCalledWith(deviceId, 3025);
    expect(mockModbusService.readFloat).toHaveBeenCalledWith(deviceId, 3059);
    expect(mockModbusService.readFloat).toHaveBeenCalledWith(deviceId, 3067);
    expect(mockModbusService.readFloat).toHaveBeenCalledWith(deviceId, 3075);
    expect(mockModbusService.readFloat).toHaveBeenCalledWith(deviceId, 3083);

    expect(mockTelemetryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId,
        current: 5.2,
        voltage: 230.5,
        activePower: 1.1,
        reactivePower: 0.5,
        apparentPower: 1.2,
        powerFactor: 0.95,
      }),
    );
  });
});
