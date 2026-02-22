import request from 'supertest';
import { app } from '../src/index';

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
});
