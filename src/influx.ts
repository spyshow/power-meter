import { InfluxDB, Point } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.INFLUXDB_URL || 'http://localhost:8086';
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG || 'my-org';
const bucket = process.env.INFLUXDB_BUCKET || 'modbus_data';

if (!token) {
  console.warn('Warning: INFLUXDB_TOKEN is not defined in .env');
}

export const influxDB = new InfluxDB({ url, token });
export const writeApi = influxDB.getWriteApi(org, bucket);
export const queryApi = influxDB.getQueryApi(org);

export const writeData = (measurement: string, tags: Record<string, string>, fields: Record<string, number>) => {
  const point = new Point(measurement);
  
  for (const [key, value] of Object.entries(tags)) {
    point.tag(key, value);
  }
  
  for (const [key, value] of Object.entries(fields)) {
    point.floatField(key, value);
  }
  
  writeApi.writePoint(point);
};

export const flushData = async () => {
  try {
    await writeApi.flush();
    console.log('Data flushed to InfluxDB');
  } catch (error) {
    console.error('Error flushing data to InfluxDB:', error);
  }
};
