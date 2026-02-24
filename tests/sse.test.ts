import request from 'supertest';
import { app } from '../src/index';
import { eventBus } from '../src/events';

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

  it('should stream peak events', (done) => {
    const req = request(app).get('/events');
    
    req.expect(200).parse((res, cb) => {
      res.on('data', (chunk) => {
        const str = chunk.toString();
        if (str.includes('peak')) {
          expect(str).toContain('"metric":"voltage"');
          req.abort();
          done();
        }
      });
    }).end((err) => {
      if (err && err.message !== 'aborted') return done(err);
    });

    setTimeout(() => {
      eventBus.emit('peak', { id: 10, metric: 'voltage', value: 245 });
    }, 50);
  });
});
