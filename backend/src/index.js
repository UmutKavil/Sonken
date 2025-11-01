import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';

// Import routes
import projectRoutes from './api/routes/projects.js';
import monitoringRoutes from './api/routes/monitoring.js';
import databaseRoutes from './api/routes/database.js';
import systemRoutes from './api/routes/system.js';
import filesRoutes from './api/routes/files.js';
import serverRoutes from './api/routes/server.js';

// Import services
import { initializeDatabase } from './database/init.js';
import { startMonitoring } from './services/monitoring-manager.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/server', serverRoutes);

// Root redirect to frontend
app.get('/', (req, res) => {
  res.redirect(FRONTEND_URL);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Initialize WebSocket Server for real-time updates
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Export WebSocket server for use in monitoring services
export { wss };

// Initialize database and start server
(async () => {
  try {
    // Initialize SQLite database
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    // Start monitoring services
    await startMonitoring(wss);
    console.log('✅ Monitoring services started');
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Sonken Backend running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server running on ws://localhost:${WS_PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
