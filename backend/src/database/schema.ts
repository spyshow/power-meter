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
