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

  it('should poll a device and save data', async () => {
    const deviceId = 10;
    mockModbusService.readFloat.mockResolvedValueOnce(230).mockResolvedValueOnce(5).mockResolvedValueOnce(1.1);

    await service.pollDevice(deviceId);

    expect(mockModbusService.readFloat).toHaveBeenCalledTimes(3);
    expect(mockTelemetryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId,
        voltage: 230,
        current: 5,
        kva: 1.1,
      }),
    );
  });
});
