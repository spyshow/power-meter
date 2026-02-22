import request from 'supertest';
import { app } from '../src/index';

describe('SSE API', () => {
  it('should respond with SSE headers', (done) => {
    const req = request(app).get('/events');
    
    req.expect(200)
      .expect('Content-Type', /text\/event-stream/)
      .expect('Connection', 'keep-alive')
      .end((err) => {
        if (err && err.message !== 'aborted') return done(err);
        done();
      });

    setTimeout(() => {
      req.abort();
    }, 100);
  });
});
