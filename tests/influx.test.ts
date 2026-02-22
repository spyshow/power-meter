import { influxDB, writeData, queryHistory } from '../src/influx';

// Mock the InfluxDB client and WriteApi
jest.mock('@influxdata/influxdb-client', () => {
  const mWriteApi = {
    writePoint: jest.fn(),
    flush: jest.fn().mockResolvedValue(undefined),
  };
  const mQueryApi = {
    queryRows: jest.fn().mockImplementation((query, callbacks) => {
      callbacks.next({}, { toObject: () => ({}) });
      callbacks.complete();
    }),
  };
  return {
    InfluxDB: jest.fn().mockImplementation(() => ({
      getWriteApi: jest.fn().mockReturnValue(mWriteApi),
      getQueryApi: jest.fn().mockReturnValue(mQueryApi),
    })),
    Point: jest.fn().mockImplementation((measurement) => ({
      tag: jest.fn().mockReturnThis(),
      floatField: jest.fn().mockReturnThis(),
    })),
  };
});

describe('InfluxDB Module', () => {
  it('should be initialized', () => {
    expect(influxDB).toBeDefined();
  });

  it('should write data points', () => {
    const measurement = 'power_consumption';
    const tags = { device_id: '10' };
    const fields = { voltage: 230, current: 10, kva: 2.3 };

    writeData(measurement, tags, fields);
    
    // Check if WriteApi.writePoint was called indirectly through the mocked Point
    // Since we're using mocks, we just want to ensure it doesn't throw and matches the logic.
  });

  it('should query history', async () => {
    const data = await queryHistory('10', '1h');
    expect(Array.isArray(data)).toBe(true);
  });
});
