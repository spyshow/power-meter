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
      await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);

      // FRESH START: Drop and recreate telemetry table to ensure clean schema
      console.log('[DatabaseInit] Performing Fresh Start: Dropping telemetry table...');
      await this.db.execute(sql`DROP TABLE IF EXISTS telemetry CASCADE;`);

      await this.db.execute(sql`
        CREATE TABLE telemetry (
          id SERIAL,
          timestamp TIMESTAMPTZ NOT NULL,
          device_id INTEGER NOT NULL,
          voltage DOUBLE PRECISION,
          current DOUBLE PRECISION,
          active_power DOUBLE PRECISION,
          reactive_power DOUBLE PRECISION,
          apparent_power DOUBLE PRECISION,
          power_factor DOUBLE PRECISION,
          PRIMARY KEY (id, timestamp)
        );
      `);

      try {
        await this.db.execute(sql`
          SELECT create_hypertable('telemetry', 'timestamp', if_not_exists => TRUE);      
        `);
        console.log('[DatabaseInit] Telemetry hypertable created.');
      } catch (err) {
        console.warn('[DatabaseInit] Hypertable setup note:', err.message);
      }

      // Ensure other tables exist
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

      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'viewer',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

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

      const userCountResult = await this.db.execute(sql`SELECT COUNT(*) FROM users;`);
      const userCount = parseInt(userCountResult.rows ? userCountResult.rows[0].count : userCountResult[0].count, 10);
      if (userCount === 0) {
        console.log('[DatabaseInit] Seeding default admin user...');
        const hashedAdminPassword = '$2b$10$MbriuN.XyYYFbmf4W.VrKuUKS7FjaGe6sfRJTPZHo.v/3ntL.hKtW';
        await this.db.execute(sql`
          INSERT INTO users (username, password, role)
          VALUES ('admin', ${hashedAdminPassword}, 'admin');
        `);
      }

      console.log('[DatabaseInit] Database initialization complete.');
    } catch (error) {
      console.error('[DatabaseInit] Error during database initialization:', error);       
    }
  }
}
