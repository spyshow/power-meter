import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from './database.module';
import { telemetry } from './schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class TelemetryRepository {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async create(data: { deviceId: number; voltage: number; current: number; kva: number }) {
    return await this.db.insert(telemetry).values({
      deviceId: data.deviceId,
      voltage: data.voltage,
      current: data.current,
      kva: data.kva,
      timestamp: new Date(),
    });
  }

  async getLatest(deviceId: number) {
    const results = await this.db
      .select()
      .from(telemetry)
      .where(eq(telemetry.deviceId, deviceId))
      .orderBy(desc(telemetry.timestamp))
      .limit(1);
    return results[0];
  }

  async getHistory(deviceId: number, startTime: Date, endTime: Date) {
    // Basic implementation for now, can be expanded with more complex filters
    return await this.db
      .select()
      .from(telemetry)
      .where(eq(telemetry.deviceId, deviceId))
      .orderBy(desc(telemetry.timestamp));
  }
}
