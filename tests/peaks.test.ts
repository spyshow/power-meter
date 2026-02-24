import { PeakService } from '../src/peaks';
import * as influx from '../src/influx';
import * as events from '../src/events';

jest.mock('../src/influx');
jest.mock('../src/events');

describe('PeakService', () => {
  let peakService: PeakService;

  beforeEach(() => {
    jest.clearAllMocks();
    peakService = new PeakService();
  });

  it('should detect and store a new peak', async () => {
    const deviceId = 10;
    const metric = 'voltage';
    const value = 230.5;

    await peakService.checkPeak(deviceId, metric, value);

    expect(peakService.getMax(deviceId, metric)).toBe(value);
    expect(influx.writeData).toHaveBeenCalledWith(
      'peak_events',
      { device_id: '10', metric: 'voltage' },
      { value: 230.5 }
    );
    expect(events.emitPeakDetected).toHaveBeenCalledWith(deviceId, metric, value);
  });

  it('should NOT update peak if value is lower or equal', async () => {
    const deviceId = 10;
    const metric = 'voltage';
    
    // Set initial peak
    await peakService.checkPeak(deviceId, metric, 230.5);
    jest.clearAllMocks();

    // Try lower value
    await peakService.checkPeak(deviceId, metric, 220.0);
    expect(peakService.getMax(deviceId, metric)).toBe(230.5);
    expect(influx.writeData).not.toHaveBeenCalled();

    // Try equal value
    await peakService.checkPeak(deviceId, metric, 230.5);
    expect(peakService.getMax(deviceId, metric)).toBe(230.5);
    expect(influx.writeData).not.toHaveBeenCalled();
  });

  it('should handle multiple metrics for the same device independently', async () => {
    const deviceId = 10;
    
    await peakService.checkPeak(deviceId, 'voltage', 230);
    await peakService.checkPeak(deviceId, 'current', 5);

    expect(peakService.getMax(deviceId, 'voltage')).toBe(230);
    expect(peakService.getMax(deviceId, 'current')).toBe(5);
  });
});
