import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DEVICES } from './devices';
import { eventBus } from './events';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/devices', (req, res) => {
  res.json(DEVICES);
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onUpdate = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  eventBus.on('update', onUpdate);

  req.on('close', () => {
    eventBus.off('update', onUpdate);
  });
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
