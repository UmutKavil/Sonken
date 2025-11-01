const express = require('express');
const router = express.Router();

// System info endpoint
router.get('/info', (req, res) => {
  res.json({
    name: 'Sonken',
    version: require('../../package.json').version,
    description: 'Modern Development Environment',
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime()
  });
});

// Status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      web_server: 'running',
      mysql: 'checking',
      mongodb: 'checking'
    }
  });
});

module.exports = router;
