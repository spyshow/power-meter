import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../database/constants';
import { reportSubscriptions } from '../database/schema';
import { eq, and } from 'drizzle-orm';

export interface CreateSubscriptionDto {
  name: string;
  deviceIds: string;
  metrics: string;
  range: string;
  granularity: string;
  format: string;
  schedule: string;
}

@Injectable()
export class SubscriptionsRepository {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async findAll() {
    return await this.db.select().from(reportSubscriptions);
  }

  async findActive() {
    return await this.db
      .select()
      .from(reportSubscriptions)
      .where(eq(reportSubscriptions.isActive, 1));
  }

  async findById(id: number) {
    const results = await this.db
      .select()
      .from(reportSubscriptions)
      .where(eq(reportSubscriptions.id, id))
      .limit(1);
    return results[0];
  }

  async create(data: CreateSubscriptionDto) {
    return await this.db.insert(reportSubscriptions).values({
      ...data,
      isActive: 1,
      createdAt: new Date(),
    });
  }

  async update(id: number, data: Partial<CreateSubscriptionDto> & { isActive?: number, lastRun?: Date }) {
    return await this.db
      .update(reportSubscriptions)
      .set(data)
      .where(eq(reportSubscriptions.id, id));
  }

  async delete(id: number) {
    return await this.db
      .delete(reportSubscriptions)
      .where(eq(reportSubscriptions.id, id));
  }
}
