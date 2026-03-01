import { pgTable, serial, timestamp, doublePrecision, integer, varchar } from 'drizzle-orm/pg-core';

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
