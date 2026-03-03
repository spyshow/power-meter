import { sql } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from './constants';
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

      // Ensure users table exists
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'viewer',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // Ensure report_subscriptions table exists
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS report_subscriptions (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          device_ids TEXT NOT NULL,
          metrics TEXT NOT NULL,
          range VARCHAR(50) NOT NULL,
          granularity VARCHAR(50) NOT NULL,
          format VARCHAR(10) NOT NULL,
          schedule VARCHAR(100) NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          last_run TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // Seed default admin if no users exist
      const userCount = await this.db.execute(sql`SELECT COUNT(*) FROM users;`);
      if (parseInt(userCount[0].count, 10) === 0) {
        console.log('[DatabaseInit] Seeding default admin user...');
        // username: admin, password: admin123
        const hashedAdminPassword = '$2b$10$MbriuN.XyYYFbmf4W.VrKuUKS7FjaGe6sfRJTPZHo.v/3ntL.hKtW';
        await this.db.execute(sql`
          INSERT INTO users (username, password, role) 
          VALUES ('admin', ${hashedAdminPassword}, 'admin');
        `);
        console.log('[DatabaseInit] Default admin user seeded.');
      }

      console.log('[DatabaseInit] Database initialization complete.');
    } catch (error) {
      console.error('[DatabaseInit] Error during database initialization:', error);
    }
  }
}
