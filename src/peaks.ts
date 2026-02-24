import { writeData } from './influx';
import { emitPeakDetected } from './events';

export class PeakService {
  private currentMax: Record<string, number> = {};

  private getKey(deviceId: number, metric: string): string {
    return `${deviceId}_${metric}`;
  }

  public async checkPeak(deviceId: number, metric: string, value: number): Promise<void> {
    const key = this.getKey(deviceId, metric);
    const existingMax = this.currentMax[key];

    if (existingMax === undefined || value > existingMax) {
      this.currentMax[key] = value;
      
      // Persist to InfluxDB
      writeData(
        'peak_events',
        { device_id: deviceId.toString(), metric },
        { value }
      );

      // Emit event for real-time UI
      emitPeakDetected(deviceId, metric, value);
      
      console.log(`[PeakService] New Peak for Device ${deviceId} (${metric}): ${value}`);
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
