import { writeData, queryAllPeaks, flushData } from './influx';
import { emitPeakDetected } from './events';

export class PeakService {
  private currentMax: Record<string, number> = {};

  public async initialize(): Promise<void> {
    try {
      const data = await queryAllPeaks();
      for (const row of data) {
        if (row.device_id && row.metric && row.value !== undefined) {
          const deviceId = parseInt(row.device_id, 10);
          const key = this.getKey(deviceId, row.metric);
          const val = parseFloat(row.value.toString());
          
          // Only set if we don't have a max yet or this one is bigger
          if (this.currentMax[key] === undefined || val > this.currentMax[key]) {
            this.currentMax[key] = val;
          }
        }
      }
      console.log(`[PeakService] Initialized. Tracked peaks: ${Object.keys(this.currentMax).length}`);
    } catch (error) {
      console.error('[PeakService] Failed to initialize peaks from database:', error);
    }
  }

  private getKey(deviceId: number, metric: string): string {
    return `${deviceId}_${metric}`;
  }

  public async checkPeak(deviceId: number, metric: string, value: number): Promise<void> {
    const key = this.getKey(deviceId, metric);
    const existingMax = this.currentMax[key];

    if (existingMax === undefined || value > existingMax) {
      const previousValue = existingMax !== undefined ? existingMax : 0;
      this.currentMax[key] = value;
      
      // Persist to InfluxDB including the previous peak for audit
      writeData(
        'peak_events',
        { device_id: deviceId.toString(), metric },
        { 
          value,
          previous_value: previousValue 
        }
      );
      
      // Ensure data is saved immediately
      await flushData();

      // Emit event for real-time UI
      emitPeakDetected(deviceId, metric, { value, previous_value: previousValue });
      
      console.log(`[PeakService] New Peak for Device ${deviceId} (${metric}): ${value} (was ${previousValue})`);
    }
  }

  public getMax(deviceId: number, metric: string): number | undefined {
    return this.currentMax[this.getKey(deviceId, metric)];
  }

  public setMax(deviceId: number, metric: string, value: number): void {
    this.currentMax[this.getKey(deviceId, metric)] = value;
  }
}

export const peaks = new PeakService();
