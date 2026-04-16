import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModbusService } from '../modbus/modbus.service';
import { TelemetryRepository } from '../database/telemetry.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PeakService } from '../peaks/peak.service';

@Injectable()
export class LoggingService implements OnModuleInit {
  private readonly DEVICE_IDS = [10, 20, 30, 40, 50, 60];
  
  // Base register for the block we want to read
  private readonly START_REG = 3010 - 1; // 3009
  private readonly REG_COUNT = (3086 - 3010); // Length to cover up to 3085

  constructor(
    private modbusService: ModbusService,
    private telemetryRepo: TelemetryRepository,
    private eventEmitter: EventEmitter2,
    private peakService: PeakService,
  ) {}

  async onModuleInit() {
    console.log('[LoggingService] Initializing high-frequency polling (1Hz target)...');
    // Start polling after a short delay for DB init
    setTimeout(() => this.pollLoop(), 5000);
  }

  private async pollLoop() {
    const startTime = Date.now();

    for (const id of this.DEVICE_IDS) {
      // Check connection status before each device poll
      if (!this.modbusService.isConnected()) {
        this.eventEmitter.emit('device.update', { id, status: 'offline' });
        continue;
      }

      try {
        await this.pollDeviceBulk(id);
      } catch (error) {
        // Error logged in pollDeviceBulk
      }
      // Small 20ms gap between different devices to let the gateway breathe
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // Calculate how long the poll took and adjust the next cycle to hit exactly 1s
    const elapsed = Date.now() - startTime;
    const delay = Math.max(0, 1000 - elapsed);
    
    setTimeout(() => this.pollLoop(), delay);
  }

  private round(val: number, decimals: number = 1): number {
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  private extractFloat(data: number[], offset: number): number {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt16BE(data[offset], 0);
    buffer.writeUInt16BE(data[offset + 1], 2);
    return buffer.readFloatBE(0);
  }

  async pollDeviceBulk(id: number) {
    try {
      // Read the entire block from 3009 to 3085 (76 registers)
      // This is much faster than 6 separate network calls
      const data = await this.modbusService.readRaw(id, this.START_REG, this.REG_COUNT);

      if (!data || data.length < this.REG_COUNT) {
        throw new Error(`Insufficient data received for device ${id}`);
      }

      // Map offsets relative to 3009 (0-based start)
      // 3010 is index 0
      // 3026 is index (3026-3010) = 16
      // 3060 is index (3060-3010) = 50
      // ... each metric is 2 registers
      
      const current = this.round(this.extractFloat(data, 0), 1);           // 3010
      const voltage = this.round(this.extractFloat(data, 16), 1);          // 3026
      const activePower = this.round(this.extractFloat(data, 50), 1);      // 3060
      const reactivePower = this.round(this.extractFloat(data, 58), 1);    // 3068
      const apparentPower = this.round(this.extractFloat(data, 66), 1);    // 3076
      const powerFactor = this.round(this.extractFloat(data, 74), 2);      // 3084

      await this.telemetryRepo.create({
        deviceId: id,
        current,
        voltage,
        activePower,
        reactivePower,
        apparentPower,
        powerFactor,
      });

      // Update peaks
      await this.peakService.checkPeak(id, 'current', current);
      await this.peakService.checkPeak(id, 'voltage', voltage);
      await this.peakService.checkPeak(id, 'activePower', activePower);
      await this.peakService.checkPeak(id, 'reactivePower', reactivePower);
      await this.peakService.checkPeak(id, 'apparentPower', apparentPower);
      await this.peakService.checkPeak(id, 'powerFactor', powerFactor);

      // Emit for UI
      this.eventEmitter.emit('device.update', {
        id, current, voltage, activePower, reactivePower, apparentPower, powerFactor,
        status: 'online',
      });

    } catch (error) {
      console.error(`[LoggingService] Bulk poll failed for device ${id}:`, error.message);
      this.eventEmitter.emit('device.update', { id, status: 'offline' });
    }
  }
}
