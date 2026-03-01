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
    const results = await this.db.insert(users).values({
      username,
      password: hashedPassword,
      role,
    }).returning();
    return results[0];
  }

  async findAll() {
    return await this.db.select().from(users);
  }

  async findOne(id: number) {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return results[0];
  }

  async findOneByUsername(username: string) {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return results[0];
  }

  async update(id: number, updateDto: any) {
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }
    const results = await this.db
      .update(users)
      .set(updateDto)
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  async remove(id: number) {
    return await this.db.delete(users).where(eq(users.id, id)).returning();
  }
}
