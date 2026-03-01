import { Controller, Sse, MessageEvent, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map, merge } from 'rxjs';
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
    const updateEvent = fromEvent(this.eventEmitter, 'device.update').pipe(
      map((data) => ({ data: JSON.stringify(data) } as MessageEvent)),
    );

    const peakEvent = fromEvent(this.eventEmitter, 'peak.detected').pipe(
      map((data: any) => ({ data: JSON.stringify({ type: 'peak', ...data }) } as MessageEvent)),
    );

    return merge(updateEvent, peakEvent);
  }
}
