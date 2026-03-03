import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ReportsService, SubscriptionsRepository, SchedulerService],
  controllers: [ReportsController],
  exports: [ReportsService, SubscriptionsRepository],
})
export class ReportsModule {}

