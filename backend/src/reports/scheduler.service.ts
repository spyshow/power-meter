import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { SubscriptionsRepository } from './subscriptions.repository';
import { ReportsService } from './reports.service';
import { CronJob } from 'cron';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private subscriptionsRepo: SubscriptionsRepository,
    private reportsService: ReportsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  // Check for active subscriptions every minute and ensure they are scheduled
  @Cron(CronExpression.EVERY_MINUTE)
  async syncSchedules() {
    const activeSubscriptions = await this.subscriptionsRepo.findActive();
    const activeIds = activeSubscriptions.map((s: any) => s.id.toString());
    
    // 1. Cleanup: Remove jobs that are no longer active or deleted
    const jobNames = Array.from(this.schedulerRegistry.getCronJobs().keys());
    for (const jobName of jobNames) {
      if (jobName.startsWith('report-sub-')) {
        const id = jobName.replace('report-sub-', '');
        if (!activeIds.includes(id)) {
          this.logger.log(`Stopping and removing orphaned job: ${jobName}`);
          try {
            const job = this.schedulerRegistry.getCronJob(jobName);
            job.stop();
          } catch (e) {
            // Job might already be stopped
          }
          this.schedulerRegistry.deleteCronJob(jobName);
        }
      }
    }

    // 2. Sync: Add or Update jobs
    for (const sub of activeSubscriptions) {
      const jobName = `report-sub-${sub.id}`;
      let exists = false;
      
      try {
        const existingJob = this.schedulerRegistry.getCronJob(jobName);
        // If schedule changed, stop and remove it so we can recreate it
        if (existingJob.cronTime.source !== sub.schedule) {
          this.logger.log(`Schedule changed for ${sub.name}, updating...`);
          existingJob.stop();
          this.schedulerRegistry.deleteCronJob(jobName);
        } else {
          exists = true;
        }
      } catch (e) {
        // Job doesn't exist
      }

      if (!exists) {
        this.logger.log(`Scheduling report: ${sub.name} (ID: ${sub.id}) with schedule: ${sub.schedule}`);
        
        const job = new CronJob(sub.schedule, async () => {
          try {
            this.logger.log(`Executing scheduled report: ${sub.name}`);
            
            const params = {
              deviceIds: sub.deviceIds.split(','),
              metrics: sub.metrics.split(','),
              range: sub.range,
              granularity: sub.granularity as 'raw' | 'aggregated',
            };

            const data = await this.reportsService.getReportData(params);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `auto-${sub.name.replace(/\s+/g, '-')}-${timestamp}`;

            if (sub.format === 'xlsx') {
              await this.reportsService.generateExcel(data, fileName);
            } else {
              await this.reportsService.generatePDF(data, fileName);
            }

            await this.subscriptionsRepo.update(sub.id, { lastRun: new Date() });
            this.logger.log(`Scheduled report complete: ${sub.name}`);
          } catch (error) {
            this.logger.error(`Error in scheduled report ${sub.name}:`, error);
          }
        });

        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
      }
    }
  }
}
