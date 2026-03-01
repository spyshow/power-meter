import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { TelemetryController } from './telemetry/telemetry.controller';
import { TelemetryRepository } from './database/telemetry.repository';
import { ModbusService } from './modbus/modbus.service';
import { LoggingService } from './logging/logging.service';
import { PeakService } from './peaks/peak.service';
import { PeaksController } from './peaks/peaks.controller';
import { EventsModule } from './events/events.module';
import { EventsController } from './events/events.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    EventsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [
    AppController,
    TelemetryController,
    PeaksController,
    EventsController,
  ],
  providers: [
    AppService,
    TelemetryRepository,
    ModbusService,
    LoggingService,
    PeakService,
  ],
})
export class AppModule {}
