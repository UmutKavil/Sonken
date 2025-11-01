const express = require('express');
const router = express.Router();
const os = require('os');

// Get server information
router.get('/info', (req, res) => {
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    loadAverage: os.loadavg(),
    nodeVersion: process.version
  });
});

// Get running services status
router.get('/services', (req, res) => {
  res.json({
    services: [
      { name: 'Web Server', status: 'running', port: process.env.PORT || 3000 },
      { name: 'MySQL', status: 'running', port: process.env.MYSQL_PORT || 3306 },
      { name: 'MongoDB', status: 'running', port: process.env.MONGODB_PORT || 27017 }
    ]
  });
});

// Get server logs (placeholder)
router.get('/logs', (req, res) => {
  res.json({
    logs: [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Server started' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'All services running' }
    ]
  });
});

module.exports = router;
