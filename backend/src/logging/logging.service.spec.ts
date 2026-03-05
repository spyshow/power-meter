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
      readRaw: jest.fn(),
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
        { provide: ModbusService, useValue: mockModbusService },
        { provide: TelemetryRepository, useValue: mockTelemetryRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: PeakService, useValue: mockPeakService },
      ],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
  });

  it('should poll a device using bulk read and save rounded data', async () => {
    const deviceId = 10;
    // Create a mock data array of 76 registers
    const mockData = new Array(76).fill(0);
    
    // Helper to write float to our mock array
    const writeFloat = (val: number, offset: number) => {
      const buf = Buffer.alloc(4);
      buf.writeFloatBE(val, 0);
      mockData[offset] = buf.readUInt16BE(0);
      mockData[offset + 1] = buf.readUInt16BE(2);
    };

    writeFloat(5.234, 0);   // Current
    writeFloat(230.567, 16); // Voltage
    writeFloat(1.111, 50);  // Active
    writeFloat(0.555, 58);  // Reactive
    writeFloat(1.222, 66);  // Apparent
    writeFloat(0.954, 74);  // PF

    mockModbusService.readRaw.mockResolvedValue(mockData);

    await service.pollDeviceBulk(deviceId);

    expect(mockModbusService.readRaw).toHaveBeenCalledWith(deviceId, 3009, 76);
    expect(mockTelemetryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId,
        current: 5.2,
        voltage: 230.6,
        activePower: 1.1,
        reactivePower: 0.6,
        apparentPower: 1.2,
        powerFactor: 0.95,
      }),
    );
  });
});
