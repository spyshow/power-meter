import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map, merge } from 'rxjs';

@Controller('api/events')
export class EventsController {
  constructor(private eventEmitter: EventEmitter2) {}

  @Sse()
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
