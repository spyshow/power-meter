import { sql } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from './database.module';
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: any) {}

  async onModuleInit() {
    await this.initializeDatabase();
  }

  async initializeDatabase() {
    console.log('[DatabaseInit] Initializing TimescaleDB...');
    try {
      // 1. Create TimescaleDB extension if not exists
      await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);

      // 2. Create tables (handled by drizzle-kit in a real migration, but here for initial setup)
      // Note: In a production app, we would use drizzle-kit push or migrations.
      // For this migration track, we'll ensure the hypertable is created.

      // Ensure telemetry table exists (minimal schema for hypertable creation)
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS telemetry (
          id SERIAL,
          timestamp TIMESTAMPTZ NOT NULL,
          device_id INTEGER NOT NULL,
          voltage DOUBLE PRECISION,
          current DOUBLE PRECISION,
          kva DOUBLE PRECISION,
          PRIMARY KEY (id, timestamp)
        );
      `);

      // 3. Convert to hypertable if not already
      try {
        await this.db.execute(sql`
          SELECT create_hypertable('telemetry', 'timestamp', if_not_exists => TRUE);
        `);
        console.log('[DatabaseInit] Telemetry hypertable verified/created.');
      } catch (err) {
        console.warn('[DatabaseInit] Failed to create hypertable (it might already exist):', err.message);
      }

      // Ensure peaks table exists
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS peaks (
          id SERIAL PRIMARY KEY,
          device_id INTEGER NOT NULL,
          metric VARCHAR(50) NOT NULL,
          value DOUBLE PRECISION NOT NULL,
          previous_value DOUBLE PRECISION NOT NULL DEFAULT 0,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      console.log('[DatabaseInit] Database initialization complete.');
    } catch (error) {
      console.error('[DatabaseInit] Error during database initialization:', error);
    }
  }
}
