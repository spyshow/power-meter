import request from 'supertest';
import { app } from '../src/index';
import { client } from '../src/modbus';
import { influxDB, writeApi } from '../src/influx';
import { eventBus } from '../src/events';

// Mock modbus-serial and influxdb-client
jest.mock('modbus-serial');
jest.mock('@influxdata/influxdb-client', () => {
  const mWriteApi = {
    writePoint: jest.fn(),
    flush: jest.fn().mockResolvedValue(undefined),
  };
  const mQueryApi = {
    queryRows: jest.fn().mockImplementation((query, callbacks) => {
      callbacks.next({}, { toObject: () => ({ voltage: 230, current: 5, kva: 1.15, _time: '2026-02-23T10:00:00Z' }) });
      callbacks.complete();
    }),
  };
  return {
    InfluxDB: jest.fn().mockImplementation(() => ({
      getWriteApi: jest.fn().mockReturnValue(mWriteApi),
      getQueryApi: jest.fn().mockReturnValue(mQueryApi),
    })),
    Point: jest.fn().mockImplementation(() => ({
      tag: jest.fn().mockReturnThis(),
      floatField: jest.fn().mockReturnThis(),
    })),
  };
});

describe('System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should flow data from Modbus to EventBus and InfluxDB', async () => {
    // 1. Mock Modbus response
    const mockData = [17280, 0]; // Big-endian for 1.0 float (actually 256 in my previous mock, let's use something recognizable)
    (client.readHoldingRegisters as jest.Mock).mockResolvedValue({ data: mockData });

    // 2. Trigger a poll manually (by importing or calling the function)
    // We already have tests for pollDevice, but let's see if we can trace the event
    const eventPromise = new Promise((resolve) => {
      eventBus.once('update', (data) => {
        resolve(data);
      });
    });

    // In a real E2E we'd wait for the interval, but here we can just call it
    const { pollDevice } = require('../src/modbus');
    await pollDevice(10);

    // 3. Verify event was emitted
    const eventData: any = await eventPromise;
    expect(eventData.id).toBe(10);

    // 4. Verify API reflects data (History)
    const response = await request(app).get('/history?deviceId=10');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
