import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../database/constants';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async create(username: string, password: string, role: string = 'viewer') {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.db.insert(users).values({
      username,
      password: hashedPassword,
      role,
    });
  }

  async findOneByUsername(username: string) {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return results[0];
  }
}
