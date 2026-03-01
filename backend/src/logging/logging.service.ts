import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModbusService } from '../modbus/modbus.service';
import { TelemetryRepository } from '../database/telemetry.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PeakService } from '../peaks/peak.service';

@Injectable()
export class LoggingService implements OnModuleInit {
  private readonly DEVICE_IDS = [10, 20, 30, 40, 50, 60];
  
  // PM5310 Register addresses
  private readonly REG_CURRENT_AVG = 3000 - 1;
  private readonly REG_VOLTAGE_LL_AVG = 3028 - 1;
  private readonly REG_KVA_TOT = 3060 - 1;

  constructor(
    private modbusService: ModbusService,
    private telemetryRepo: TelemetryRepository,
    private eventEmitter: EventEmitter2,
    private peakService: PeakService,
  ) {}

  async onModuleInit() {
    this.startLogging();
  }

  async startLogging() {
    const runLogging = async () => {
      for (const id of this.DEVICE_IDS) {
        if (!this.modbusService.isConnected()) break;
        try {
          await this.pollDevice(id);
        } catch (error) {
          // Error already handled in pollDevice or ModbusService
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      setTimeout(() => runLogging(), 1000);
    };

    runLogging();
  }

  async pollDevice(id: number) {
    try {
      const voltage = await this.modbusService.readFloat(id, this.REG_VOLTAGE_LL_AVG);
      const current = await this.modbusService.readFloat(id, this.REG_CURRENT_AVG);
      const kva = await this.modbusService.readFloat(id, this.REG_KVA_TOT);

      await this.telemetryRepo.create({
        deviceId: id,
        voltage,
        current,
        kva,
      });

      // Check peaks
      await this.peakService.checkPeak(id, 'voltage', voltage);
      await this.peakService.checkPeak(id, 'current', current);
      await this.peakService.checkPeak(id, 'kva', kva);

      // Emit event for real-time UI
      this.eventEmitter.emit('device.update', {
        id,
        voltage,
        current,
        kva,
        status: 'online',
      });
    } catch (error) {
      // Log error but don't crash
      console.error(`[LoggingService] Failed to poll device ${id}:`, error.message);
      
      // Emit offline status
      this.eventEmitter.emit('device.update', {
        id,
        status: 'offline',
      });
      
      throw error;
    }
  }
}
