import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { TelemetryRepository } from '../database/telemetry.repository';

@Controller()
export class TelemetryController {
  constructor(private telemetryRepo: TelemetryRepository) {}

  @Get('devices')
  getDevices() {
    // Ported from src/devices.ts
    return [
      { id: 10, name: '1000' },
      { id: 20, name: '2000' },
      { id: 30, name: '3000' },
      { id: 40, name: '4000' },
      { id: 50, name: '5000' },
      { id: 60, name: '6000' },
    ];
  }

  @Get('history')
  async getHistory(
    @Query('deviceId') deviceId: string,
    @Query('range') range: string,
  ) {
    if (!deviceId) {
      throw new BadRequestException('deviceId is required');
    }

    const id = parseInt(deviceId, 10);
    const now = new Date();
    let startTime = new Date(now.getTime() - 60 * 60 * 1000); // Default 1h

    if (range) {
      const match = range.match(/^(\d+)([mhd])$/);
      if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        const msMap: Record<string, number> = { m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
        startTime = new Date(now.getTime() - value * msMap[unit]);
      }
    }

    const data = await this.telemetryRepo.getHistory(id, startTime);
    
    // Map to frontend format (_time instead of timestamp)
    return data.map((row: any) => ({
      _time: row.timestamp,
      voltage: row.voltage,
      current: row.current,
      kva: row.kva,
    }));
  }
}
