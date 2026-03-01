import { Module, Global } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: true,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when maximum amount of listeners, is exceeded
      verboseMemoryLeak: false,
      // disable throwing error of unhandled error event
      ignoreErrors: false,
    }),
  ],
  exports: [EventEmitterModule],
})
export class EventsModule {}
