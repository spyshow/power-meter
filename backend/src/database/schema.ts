import { pgTable, serial, timestamp, doublePrecision, integer, varchar, text } from 'drizzle-orm/pg-core';

export const telemetry = pgTable('telemetry', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  deviceId: integer('device_id').notNull(),
  voltage: doublePrecision('voltage'),
  current: doublePrecision('current'),
  kva: doublePrecision('kva'),
});

export const peaks = pgTable('peaks', {
  id: serial('id').primaryKey(),
  deviceId: integer('device_id').notNull(),
  metric: varchar('metric', { length: 50 }).notNull(),
  value: doublePrecision('value').notNull(),
  previousValue: doublePrecision('previous_value').notNull().default(0),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('viewer'), // admin, operator, viewer
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reportSubscriptions = pgTable('report_subscriptions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  deviceIds: text('device_ids').notNull(), // Comma-separated or JSON string
  metrics: text('metrics').notNull(),     // Comma-separated or JSON string
  range: varchar('range', { length: 50 }).notNull(), // e.g. '24h', '7d'
  granularity: varchar('granularity', { length: 50 }).notNull(), // 'raw', 'aggregated'
  format: varchar('format', { length: 10 }).notNull(), // 'pdf', 'xlsx'
  schedule: varchar('schedule', { length: 100 }).notNull(), // Cron expression or interval
  isActive: integer('is_active').notNull().default(1),
  lastRun: timestamp('last_run'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
