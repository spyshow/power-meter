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
    // Using raw SQL to bypass any Drizzle schema caching/mismatch issues
    return await this.db.execute(sql`
      INSERT INTO telemetry (
        device_id, 
        voltage, 
        current, 
        active_power, 
        reactive_power, 
        apparent_power, 
        power_factor,
        timestamp
      ) VALUES (
        ${data.deviceId}, 
        ${data.voltage}, 
        ${data.current}, 
        ${data.activePower}, 
        ${data.reactivePower}, 
        ${data.apparentPower}, 
        ${data.powerFactor},
        NOW()
      )
    `);
  }

  async getLatest(deviceId: number) {
    const results = await this.db.execute(sql`
      SELECT * FROM telemetry 
      WHERE device_id = ${deviceId} 
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    const rows = results.rows || results;
    return rows[0];
  }

  async getHistory(deviceId: number, startTime: Date, interval?: string) {
    if (!interval || interval === '1s') {
      const results = await this.db.execute(sql`
        SELECT * FROM telemetry 
        WHERE device_id = ${deviceId} AND timestamp >= ${startTime.toISOString()}
        ORDER BY timestamp ASC
      `);
      return results.rows || results;
    }

    const results = await this.db.execute(sql`
      SELECT
        time_bucket(${sql.raw(`'${interval}'`)}, timestamp) AS timestamp,
        AVG(voltage) as voltage,
        AVG(current) as current,
        AVG(active_power) as active_power,
        AVG(reactive_power) as reactive_power,
        AVG(apparent_power) as apparent_power,
        AVG(power_factor) as power_factor
      FROM telemetry
      WHERE device_id = ${deviceId} AND timestamp >= ${startTime.toISOString()}
      GROUP BY timestamp
      ORDER BY timestamp ASC
    `);
    return results.rows || results;
  }
}
