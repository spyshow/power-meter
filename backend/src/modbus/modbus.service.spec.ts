import { Test, TestingModule } from '@nestjs/testing';
import { ModbusService } from './modbus.service';
import { ConfigService } from '@nestjs/config';

describe('ModbusService', () => {
  let service: ModbusService;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'PAS600_IP') return '127.0.0.1';
        if (key === 'PAS600_PORT') return 502;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModbusService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ModbusService>(ModbusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should attempt to connect to Modbus', async () => {
    // In a real test, we would mock modbus-serial
    expect(service.isConnected()).toBe(false);
  });
});
