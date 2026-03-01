import { Controller, Get, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../database/database.module';
import { peaks } from '../database/schema';

@Controller('api/peaks')
export class PeaksController {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  @Get()
  async getPeaks() {
    return await this.db.select().from(peaks);
  }
}
