import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../database/database.module';
import { peaks } from '../database/schema';
import { sql } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PeakService implements OnModuleInit {
  private currentMax: Record<string, number> = {};

  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: any,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.initialize();
  }

  async initialize() {
    try {
      const data = await this.db.select().from(peaks);
      for (const row of data) {
        const key = this.getKey(row.deviceId, row.metric);
        if (this.currentMax[key] === undefined || row.value > this.currentMax[key]) {
          this.currentMax[key] = row.value;
        }
      }
      console.log(`[PeakService] Initialized. Tracked peaks: ${Object.keys(this.currentMax).length}`);
    } catch (error) {
      console.error('[PeakService] Failed to initialize peaks:', error);
    }
  }

  private getKey(deviceId: number, metric: string): string {
    return `${deviceId}_${metric}`;
  }

  async checkPeak(deviceId: number, metric: string, value: number) {
    const key = this.getKey(deviceId, metric);
    const existingMax = this.currentMax[key];

    if (existingMax === undefined || value > existingMax) {
      const previousValue = existingMax !== undefined ? existingMax : 0;
      this.currentMax[key] = value;

      try {
        await this.db.insert(peaks).values({
          deviceId,
          metric,
          value,
          previousValue,
          timestamp: new Date(),
        });

        // Emit peak detection event for real-time UI
        this.eventEmitter.emit('peak.detected', {
          deviceId,
          metric,
          value,
          previousValue,
        });
        
        console.log(`[PeakService] New Peak for Device ${deviceId} (${metric}): ${value} (was ${previousValue})`);
      } catch (error) {
        console.error('[PeakService] Failed to save peak:', error);
      }
    }
  }

  getMax(deviceId: number, metric: string): number | undefined {
    return this.currentMax[this.getKey(deviceId, metric)];
  }
}
