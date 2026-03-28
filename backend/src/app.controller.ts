import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { interval, map, Observable } from 'rxjs';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  @Sse('test-sse')
  testSse(): Observable<MessageEvent> {
    return interval(1000).pipe(
      map(() => ({ data: { hello: 'world', time: new Date().toISOString() } } as MessageEvent)),
    );
  }
}
