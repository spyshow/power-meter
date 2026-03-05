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
    console.log('[LoggingService] Waiting 5s for DB init before starting polling...');
    setTimeout(() => this.startLogging(), 5000);
  }

  async startLogging() {
    const runLogging = async () => {
      for (const id of this.DEVICE_IDS) {
        if (!this.modbusService.isConnected()) break;
        try {
          await this.pollDevice(id);
        } catch (error) {
          // Handled in pollDevice
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      setTimeout(() => runLogging(), 1000);
    };

    runLogging();
  }

  private round(val: number, decimals: number = 1): number {
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  async pollDevice(id: number) {
    try {
      const currentRaw = await this.modbusService.readFloat(id, this.REG_CURRENT_AVG);
      const voltageRaw = await this.modbusService.readFloat(id, this.REG_VOLTAGE_LL_AVG);
      const activePowerRaw = await this.modbusService.readFloat(id, this.REG_ACTIVE_POWER_TOT);
      const reactivePowerRaw = await this.modbusService.readFloat(id, this.REG_REACTIVE_POWER_TOT);
      const apparentPowerRaw = await this.modbusService.readFloat(id, this.REG_APPARENT_POWER_TOT);
      const powerFactorRaw = await this.modbusService.readFloat(id, this.REG_POWER_FACTOR_TOT);

      // Round values: PF to 2 decimals, others to 1
      const current = this.round(currentRaw, 1);
      const voltage = this.round(voltageRaw, 1);
      const activePower = this.round(activePowerRaw, 1);
      const reactivePower = this.round(reactivePowerRaw, 1);
      const apparentPower = this.round(apparentPowerRaw, 1);
      const powerFactor = this.round(powerFactorRaw, 2);

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

      // Emit event
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
      console.error(`[LoggingService] Failed to poll device ${id}:`, error.message);
      this.eventEmitter.emit('device.update', { id, status: 'offline' });
      throw error;
    }
  }
}
