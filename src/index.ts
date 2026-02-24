import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DEVICES } from './devices';
import { eventBus } from './events';
import { queryHistory } from './influx';
import { connectModbus, startPolling } from './modbus';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/devices', (req, res) => {
  res.json(DEVICES);
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // For proxy support
  res.flushHeaders();

  const onUpdate = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  eventBus.on('update', onUpdate);

  req.on('close', () => {
    eventBus.off('update', onUpdate);
  });
});

app.get('/history', async (req, res) => {
  const { deviceId, range } = req.query;
  if (!deviceId) {
    return res.status(400).json({ error: 'deviceId is required' });
  }

  try {
    const data = await queryHistory(deviceId as string, (range as string) || '1h');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error querying history' });
  }
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`);
    await connectModbus();
    startPolling();
  });
}
