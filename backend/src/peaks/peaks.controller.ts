import { Controller, Get, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../database/constants';
import { peaks } from '../database/schema';

@Controller('peaks')
export class PeaksController {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  @Get()
  async getPeaks() {
    try {
      const data = await this.db.select().from(peaks);
      // Map to snake_case for frontend compatibility if Drizzle returns camelCase
      return data.map((row: any) => ({
        id: row.id,
        device_id: row.deviceId,
        metric: row.metric,
        value: row.value,
        previous_value: row.previousValue,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      console.error('[PeaksController] Error fetching peaks:', error);
      throw error;
    }
  }
}
