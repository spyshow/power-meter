import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../database/constants';
import { peaks } from '../database/schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('peaks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PeaksController {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  @Get()
  @Roles(Role.Admin, Role.Operator, Role.Viewer)
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
