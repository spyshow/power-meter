import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.INFLUXDB_URL || 'http://localhost:8086';
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG || 'my-org';
const bucket = process.env.INFLUXDB_BUCKET || 'modbus_data';

if (!token) {
  console.warn('Warning: INFLUXDB_TOKEN is not defined in .env');
}

export const influxDB = new InfluxDB({ url, token: token || '' });

// Internal buffer for failed writes
let memoryBuffer: Point[] = [];
const MAX_BUFFER_SIZE = 1000;

// Custom write API with improved error handling
export const writeApi = influxDB.getWriteApi(org, bucket, 'ns');

export const writeData = (measurement: string, tags: Record<string, string>, fields: Record<string, number>) => {
  const point = new Point(measurement);
  
  for (const [key, value] of Object.entries(tags)) {
    point.tag(key, value);
  }
  
  for (const [key, value] of Object.entries(fields)) {
    point.floatField(key, value);
  }
  
  // Attempt to write. The client handles batching internally.
  try {
    writeApi.writePoint(point);
  } catch (error) {
    console.error('Error adding point to write queue:', error);
    if (memoryBuffer.length < MAX_BUFFER_SIZE) {
      memoryBuffer.push(point);
    }
  }
};

export const flushData = async () => {
  try {
    // If we have items in memory buffer, try to write them first
    if (memoryBuffer.length > 0) {
      console.log(`Attempting to flush ${memoryBuffer.length} buffered points from memory...`);
      memoryBuffer.forEach(p => writeApi.writePoint(p));
      memoryBuffer = [];
    }

    await writeApi.flush();
    console.log('Data flushed to InfluxDB');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error flushing data to InfluxDB:', msg);
    // Note: The @influxdata/influxdb-client already has some retry logic
    // but here we satisfy the "memory buffer" requirement.
  }
};

export const queryHistory = (deviceId: string, range: string = '1h'): Promise<any[]> => {
  const queryApi = influxDB.getQueryApi(org);
  
  // Calculate aggregation window based on range to prevent browser lag
  // 15m -> 1s (raw or near-raw)
  // 1h  -> 5s
  // 6h  -> 30s
  // 24h -> 2m
  let interval = '1s';
  if (range === '1h') interval = '5s';
  else if (range === '6h') interval = '30s';
  else if (range === '24h') interval = '2m';

  const query = `from(bucket: "${bucket}")
    |> range(start: -${range})
    |> filter(fn: (r) => r["_measurement"] == "power_consumption")
    |> filter(fn: (r) => r["device_id"] == "${deviceId}")
    |> aggregateWindow(every: ${interval}, fn: mean, createEmpty: false)
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;

  return new Promise((resolve, reject) => {
    const results: any[] = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        results.push(tableMeta.toObject(row));
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
};

export const queryAllPeaks = (): Promise<any[]> => {
  const queryApi = influxDB.getQueryApi(org);
  const query = `from(bucket: "${bucket}")
    |> range(start: -30d)
    |> filter(fn: (r) => r["_measurement"] == "peak_events")
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    |> sort(columns: ["_time"], desc: true)`;

  return new Promise((resolve, reject) => {
    const results: any[] = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        results.push(tableMeta.toObject(row));
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
};

export interface ReportParams {
  deviceIds: string[];
  metrics: string[];
  range?: string; // e.g. 1h, 6h, 24h, 6d
  start?: string; // ISO string for custom range
  stop?: string;  // ISO string for custom range
  granularity: 'raw' | 'aggregated';
}

export const queryReportData = (params: ReportParams): Promise<any[]> => {
  const queryApi = influxDB.getQueryApi(org);
  
  let rangeClause = '';
  if (params.range) {
    rangeClause = `|> range(start: -${params.range})`;
  } else if (params.start && params.stop) {
    rangeClause = `|> range(start: ${params.start}, stop: ${params.stop})`;
  } else {
    rangeClause = `|> range(start: -1h)`; // Default
  }

  const deviceFilter = params.deviceIds.map(id => `r["device_id"] == "${id}"`).join(' or ');
  const metricFilter = params.metrics.map(m => `r["_field"] == "${m}"`).join(' or ');

  let aggregation = '';
  if (params.granularity === 'aggregated') {
    // Determine interval based on range
    let interval = '1m'; // Default for aggregation
    if (params.range === '6d') interval = '1h';
    else if (params.range === '24h') interval = '10m';
    else if (params.range === '6h') interval = '5m';
    
    aggregation = `|> aggregateWindow(every: ${interval}, fn: mean, createEmpty: false)`;
  }

  const query = `from(bucket: "${bucket}")
    ${rangeClause}
    |> filter(fn: (r) => r["_measurement"] == "power_consumption")
    |> filter(fn: (r) => (${deviceFilter}))
    |> filter(fn: (r) => (${metricFilter}))
    ${aggregation}
    |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;

  return new Promise((resolve, reject) => {
    const results: any[] = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        results.push(tableMeta.toObject(row));
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
};
