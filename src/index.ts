import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DEVICES } from './devices';

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

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
