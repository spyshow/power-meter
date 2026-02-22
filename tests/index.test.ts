import request from 'supertest';
import { app } from '../src/index';

jest.mock('../src/influx', () => ({
  queryHistory: jest.fn().mockResolvedValue([]),
}));

describe('API Routes', () => {
  it('should return ok on /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return list of 6 devices on /devices', async () => {
    const response = await request(app).get('/devices');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(6);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
  });

  it('should return historical data on /history', async () => {
    const response = await request(app).get('/history?deviceId=10&range=1h');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
