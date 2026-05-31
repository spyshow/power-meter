import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ModbusService } from '../modbus/modbus.service';
import { TelemetryRepository } from '../database/telemetry.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PeakService } from '../peaks/peak.service';

@Injectable()
export class LoggingService implements OnModuleInit {
  private readonly logger = new Logger(LoggingService.name);
  private readonly DEVICE_IDS = [10, 20, 30, 40, 50, 60];
  private wasDisconnected = false;
  
  // Track consecutive failures per device to allow for transient issues
  private failureCounters: Map<number, number> = new Map();
  private readonly MAX_RETRIES = 3;

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
    this.logger.log('Initializing high-frequency polling (1Hz target)...');
    // Start polling after a short delay for DB init
    setTimeout(() => this.pollLoop(), 5000);
  }

  private async pollLoop() {
    const startTime = Date.now();
    const isCurrentlyConnected = this.modbusService.isConnected();

    if (!isCurrentlyConnected) {
      if (!this.wasDisconnected) {
        this.logger.warn('Modbus system is OFFLINE. Attempting to reconnect...');
        this.wasDisconnected = true;
      }
      // Try to trigger a reconnect through modbus service
      this.modbusService.connect();

      // Report all devices as offline
      for (const id of this.DEVICE_IDS) {
        this.eventEmitter.emit('device.update', { id, status: 'offline' });
      }
    } else {
      if (this.wasDisconnected) {
        this.logger.log('Modbus system is BACK ONLINE. Resuming device polls.');
        this.wasDisconnected = false;
      }

      for (const id of this.DEVICE_IDS) {
        // Re-check before each poll in case it dropped during the loop
        if (!this.modbusService.isConnected()) break;

        try {
          await this.pollDeviceBulk(id);
        } catch (error) {
          // Error logged in pollDeviceBulk
        }
        // Small 50ms gap between different devices to let the gateway breathe
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
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
      const data = await this.modbusService.readRaw(id, this.START_REG, this.REG_COUNT);

      if (!data || data.length < this.REG_COUNT) {
        throw new Error(`Insufficient data received for device ${id}`);
      }

      const current = this.round(this.extractFloat(data, 0), 1);           // 3010
      const voltage = this.round(this.extractFloat(data, 16), 1);          // 3026
      const activePower = this.round(this.extractFloat(data, 50), 1);      // 3060
      const reactivePower = this.round(this.extractFloat(data, 58), 1);    // 3068
      const apparentPower = this.round(this.extractFloat(data, 66), 1);    // 3076
      let powerFactor = this.round(this.extractFloat(data, 74), 2);        // 3084

      if (isNaN(powerFactor)) powerFactor = 0;

      // Validate data before proceeding
      const nanFields = [];
      if (isNaN(current)) nanFields.push('current');
      if (isNaN(voltage)) nanFields.push('voltage');
      if (isNaN(activePower)) nanFields.push('activePower');
      if (isNaN(reactivePower)) nanFields.push('reactivePower');
      if (isNaN(apparentPower)) nanFields.push('apparentPower');

      if (nanFields.length > 0) {
        this.logger.warn(
          `Skipping device ${id} poll due to NaN values in fields: ${nanFields.join(', ')}`,
        );
        return;
      }

      // Reset failure counter on success
      this.failureCounters.set(id, 0);

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
      const currentFailures = (this.failureCounters.get(id) || 0) + 1;
      this.failureCounters.set(id, currentFailures);
      
      this.logger.error(`Bulk poll failed for device ${id} (Failure ${currentFailures}/${this.MAX_RETRIES}): ${error.message}`);
      
      // Only emit offline if we exceeded max retries
      if (currentFailures >= this.MAX_RETRIES) {
        this.eventEmitter.emit('device.update', { id, status: 'offline' });
      }
    }
  }
}

