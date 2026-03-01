import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { TelemetryRepository } from '../database/telemetry.repository';

@Controller('telemetry')
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
    // Note: Range logic will be implemented in the repository/service
    return await this.telemetryRepo.getHistory(id, new Date(), new Date());
  }
}
