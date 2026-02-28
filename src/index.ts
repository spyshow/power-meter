import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DEVICES } from './devices';
import { eventBus } from './events';
import { queryHistory, queryAllPeaks, queryReportData } from './influx';
import { generateExcel, generatePDF } from './reports';
import { connectModbus, startPolling, deviceStatus } from './modbus';
import { peaks } from './peaks';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: true, // Dynamically allow the origin of the request to support network access
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

  // Send initial state
  Object.keys(deviceStatus).forEach(id => {
    const status = deviceStatus[parseInt(id)];
    if (status) {
      res.write(`data: ${JSON.stringify({ id: parseInt(id), ...status })}\n\n`);
    }
  });

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 15000);

  const onUpdate = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const onPeak = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'peak', ...data })}\n\n`);
  };

  eventBus.on('update', onUpdate);
  eventBus.on('peak', onPeak);

  req.on('close', () => {
    clearInterval(heartbeat);
    eventBus.off('update', onUpdate);
    eventBus.off('peak', onPeak);
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

app.get('/peaks', async (req, res) => {
  try {
    const data = await queryAllPeaks();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error querying peaks' });
  }
});

app.post('/reports/data', async (req, res) => {
  try {
    const data = await queryReportData(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error querying report data' });
  }
});

app.post('/reports/export', async (req, res) => {
  const { data, format, fileName } = req.body;
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = fileName || 'report';
    const fullFileName = `${baseName}_${timestamp}`;
    
    let filePath = '';
    if (format === 'pdf') {
      filePath = await generatePDF(data, fullFileName);
    } else {
      filePath = await generateExcel(data, fullFileName);
    }
    
    res.json({ success: true, fileName: path.basename(filePath) });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Error exporting report' });
  }
});

app.get('/reports/history', (req, res) => {
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    return res.json([]);
  }
  
  const files = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.pdf') || file.endsWith('.xlsx'))
    .map(file => {
      const stats = fs.statSync(path.join(reportsDir, file));
      return {
        name: file,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
  
  res.json(files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
});

app.get('/reports/download/:fileName', (req, res) => {
  const filePath = path.join(process.cwd(), 'reports', req.params.fileName);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, async () => {
    console.log(`Server is running on http://localhost:${port}`);
    await peaks.initialize();
    await connectModbus();
    startPolling();
  });
}
