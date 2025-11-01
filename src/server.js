const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const chalk = require('chalk');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const apiRoutes = require('./routes/api');
const databaseRoutes = require('./routes/database');
const serverRoutes = require('./routes/server');
const metricsRoutes = require('./routes/metrics');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: process.env.MAX_UPLOAD_SIZE || '50mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_UPLOAD_SIZE || '50mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Track all requests for metrics
app.use(metricsRoutes.trackRequest);

// API Routes
app.use('/api', apiRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/metrics', metricsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('../package.json').version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Dashboard endpoint
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n' + chalk.cyan('═'.repeat(60)));
  console.log(chalk.bold.green('  🚀 Sonken Server Started Successfully!'));
  console.log(chalk.cyan('═'.repeat(60)));
  console.log(chalk.yellow('  Server Information:'));
  console.log(chalk.white(`  • Local:            http://localhost:${PORT}`));
  console.log(chalk.white(`  • Network:          http://0.0.0.0:${PORT}`));
  console.log(chalk.white(`  • Environment:      ${process.env.NODE_ENV || 'development'}`));
  console.log(chalk.white(`  • Node Version:     ${process.version}`));
  console.log(chalk.cyan('═'.repeat(60)));
  console.log(chalk.green('  Ready to accept connections! 🎉\n'));
  
  logger.info(`Sonken server started on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n⚠️  SIGTERM signal received: closing HTTP server'));
  server.close(() => {
    console.log(chalk.green('✓ HTTP server closed'));
    logger.info('Server shutdown gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  SIGINT signal received: closing HTTP server'));
  server.close(() => {
    console.log(chalk.green('✓ HTTP server closed'));
    logger.info('Server shutdown gracefully');
    process.exit(0);
  });
});

module.exports = app;
