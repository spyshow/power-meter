import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from './constants';
import { telemetry } from './schema';
import { eq, desc, asc, gte, and, sql } from 'drizzle-orm';

@Injectable()
export class TelemetryRepository {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async create(data: {
    deviceId: number;
    voltage: number;
    current: number;
    activePower: number;
    reactivePower: number;
    apparentPower: number;
    powerFactor: number;
  }) {
    return await this.db.insert(telemetry).values({
      deviceId: data.deviceId,
      voltage: data.voltage,
      current: data.current,
      activePower: data.activePower,
      reactivePower: data.reactivePower,
      apparentPower: data.apparentPower,
      powerFactor: data.powerFactor,
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

  async getHistory(deviceId: number, startTime: Date, interval?: string) {
    if (!interval || interval === '1s') {
      return await this.db
        .select()
        .from(telemetry)
        .where(
          and(
            eq(telemetry.deviceId, deviceId),
            gte(telemetry.timestamp, startTime)
          )
        )
        .orderBy(asc(telemetry.timestamp));
    }

    // Use TimescaleDB time_bucket for aggregation
    return await this.db.execute(sql`
      SELECT
        time_bucket(${sql.raw(`'${interval}'`)}, timestamp) AS timestamp,
        AVG(voltage) as voltage,
        AVG(current) as current,
        AVG(active_power) as "activePower",
        AVG(reactive_power) as "reactivePower",
        AVG(apparent_power) as "apparentPower",
        AVG(power_factor) as "powerFactor"
      FROM telemetry
      WHERE device_id = ${deviceId} AND timestamp >= ${startTime}
      GROUP BY timestamp
      ORDER BY timestamp ASC
    `);
  }
}
