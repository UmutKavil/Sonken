import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/projects', (req, res) => res.json({ success: true, data: [] }));
app.listen(3001, () => console.log('Backend running on http://localhost:3001'));