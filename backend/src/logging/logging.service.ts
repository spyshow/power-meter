import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModbusService } from '../modbus/modbus.service';
import { TelemetryRepository } from '../database/telemetry.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PeakService } from '../peaks/peak.service';

@Injectable()
export class LoggingService implements OnModuleInit {
  private readonly DEVICE_IDS = [10, 20, 30, 40, 50, 60];
  
  // PM5310 Register addresses (Converted to 0-based for Modbus library)
  private readonly REG_CURRENT_AVG = 3010 - 1;
  private readonly REG_VOLTAGE_LL_AVG = 3026 - 1;
  private readonly REG_ACTIVE_POWER_TOT = 3060 - 1;
  private readonly REG_REACTIVE_POWER_TOT = 3068 - 1;
  private readonly REG_APPARENT_POWER_TOT = 3076 - 1;
  private readonly REG_POWER_FACTOR_TOT = 3084 - 1;

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
      const current = await this.modbusService.readFloat(id, this.REG_CURRENT_AVG);
      const voltage = await this.modbusService.readFloat(id, this.REG_VOLTAGE_LL_AVG);
      const activePower = await this.modbusService.readFloat(id, this.REG_ACTIVE_POWER_TOT);
      const reactivePower = await this.modbusService.readFloat(id, this.REG_REACTIVE_POWER_TOT);
      const apparentPower = await this.modbusService.readFloat(id, this.REG_APPARENT_POWER_TOT);
      const powerFactor = await this.modbusService.readFloat(id, this.REG_POWER_FACTOR_TOT);

      await this.telemetryRepo.create({
        deviceId: id,
        current,
        voltage,
        activePower,
        reactivePower,
        apparentPower,
        powerFactor,
      });

      // Check peaks
      await this.peakService.checkPeak(id, 'current', current);
      await this.peakService.checkPeak(id, 'voltage', voltage);
      await this.peakService.checkPeak(id, 'activePower', activePower);
      await this.peakService.checkPeak(id, 'reactivePower', reactivePower);
      await this.peakService.checkPeak(id, 'apparentPower', apparentPower);
      await this.peakService.checkPeak(id, 'powerFactor', powerFactor);

      // Emit event for real-time UI
      this.eventEmitter.emit('device.update', {
        id,
        current,
        voltage,
        activePower,
        reactivePower,
        apparentPower,
        powerFactor,
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
