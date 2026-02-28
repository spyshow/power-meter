import { queryReportData } from '../src/influx';

// Mock the InfluxDB client and WriteApi
jest.mock('@influxdata/influxdb-client', () => {
  const mWriteApi = {
    writePoint: jest.fn(),
    flush: jest.fn().mockResolvedValue(undefined),
  };
  const mQueryApi = {
    queryRows: jest.fn().mockImplementation((query, callbacks) => {
      // Mock some data returned from InfluxDB
      callbacks.next({}, { toObject: () => ({ _time: '2026-02-25T10:00:00Z', device_id: '10', voltage: 230, current: 5, kva: 1.15 }) });
      callbacks.complete();
    }),
  };
  return {
    InfluxDB: jest.fn().mockImplementation(() => ({
      getWriteApi: jest.fn().mockReturnValue(mWriteApi),
      getQueryApi: jest.fn().mockReturnValue(mQueryApi),
    })),
    Point: jest.fn(),
  };
});

describe('Report Data Logic', () => {
  it('should query report data with correct parameters', async () => {
    const params = {
      deviceIds: ['10', '20'],
      metrics: ['voltage', 'current'],
      range: '1h',
      granularity: 'aggregated' as const
    };

    const data = await queryReportData(params);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('voltage');
    expect(data[0]).toHaveProperty('current');
  });

  it('should support custom date ranges', async () => {
    const params = {
      deviceIds: ['10'],
      metrics: ['kva'],
      start: '2026-02-25T00:00:00Z',
      stop: '2026-02-25T23:59:59Z',
      granularity: 'raw' as const
    };

    const data = await queryReportData(params);
    expect(Array.isArray(data)).toBe(true);
  });
});
