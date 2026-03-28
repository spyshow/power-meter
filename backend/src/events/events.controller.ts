import { Controller, Sse, MessageEvent, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map, merge, interval, of } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private eventEmitter: EventEmitter2) {}

  @Sse()
  @Roles(Role.Admin, Role.Operator, Role.Viewer)
  stream(): Observable<MessageEvent> {
    console.log('[EventsController] New client connected to SSE stream');

    const updateEvent = fromEvent(this.eventEmitter, 'device.update').pipe(
      map((data: any) => ({ data: JSON.stringify({ type: 'update', ...data }) } as MessageEvent)),
    );

    const peakEvent = fromEvent(this.eventEmitter, 'peak.detected').pipe(
      map((data: any) => ({ data: JSON.stringify({ type: 'peak', ...data }) } as MessageEvent)),
    );

    const keepAlive = interval(15000).pipe(
      map(() => ({ data: JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }) } as MessageEvent)),
    );

    const initialEvent = of({
      data: JSON.stringify({ type: 'connected', timestamp: Date.now() }),
    } as MessageEvent);

    return merge(initialEvent, updateEvent, peakEvent, keepAlive);
  }
}
