const express = require('express');
const router = express.Router();
const os = require('os');

// Site metrics storage (in production, use Redis or database)
const siteMetrics = new Map();
const trafficHistory = new Map();

// Middleware to track requests
function trackRequest(req, res, next) {
  const site = req.headers.host || 'unknown';
  const metric = siteMetrics.get(site) || {
    requestCount: 0,
    bytesReceived: 0,
    bytesSent: 0,
    errorCount: 0,
    avgResponseTime: 0,
    lastRequest: null
  };

  const startTime = Date.now();
  
  // Track request
  metric.requestCount++;
  metric.bytesReceived += parseInt(req.headers['content-length'] || 0);
  metric.lastRequest = new Date();

  // Intercept response
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    metric.avgResponseTime = (metric.avgResponseTime + responseTime) / 2;
    metric.bytesSent += Buffer.byteLength(data || '');
    
    if (res.statusCode >= 400) {
      metric.errorCount++;
    }
    
    siteMetrics.set(site, metric);
    originalSend.apply(res, arguments);
  };

  next();
}

// Get all site metrics
router.get('/sites/metrics', (req, res) => {
  const metrics = [];
  
  siteMetrics.forEach((metric, site) => {
    metrics.push({
      site,
      ...metric,
      bytesReceivedMB: (metric.bytesReceived / (1024 * 1024)).toFixed(2),
      bytesSentMB: (metric.bytesSent / (1024 * 1024)).toFixed(2),
      totalTrafficMB: ((metric.bytesReceived + metric.bytesSent) / (1024 * 1024)).toFixed(2)
    });
  });

  res.json({
    success: true,
    metrics
  });
});

// Get specific site metrics
router.get('/sites/metrics/:site', (req, res) => {
  const { site } = req.params;
  const metric = siteMetrics.get(site);

  if (!metric) {
    return res.status(404).json({
      success: false,
      error: 'Site not found'
    });
  }

  res.json({
    success: true,
    site,
    ...metric,
    bytesReceivedMB: (metric.bytesReceived / (1024 * 1024)).toFixed(2),
    bytesSentMB: (metric.bytesSent / (1024 * 1024)).toFixed(2),
    totalTrafficMB: ((metric.bytesReceived + metric.bytesSent) / (1024 * 1024)).toFixed(2)
  });
});

// Get real-time system metrics
router.get('/system/realtime', (req, res) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  // Calculate CPU usage
  let totalIdle = 0;
  let totalTick = 0;
  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const cpuUsage = 100 - ~~(100 * totalIdle / totalTick);

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    cpu: {
      usage: cpuUsage,
      cores: cpus.length,
      model: cpus[0].model,
      speed: cpus[0].speed
    },
    memory: {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      usagePercent: ((usedMem / totalMem) * 100).toFixed(2),
      totalGB: (totalMem / (1024 ** 3)).toFixed(2),
      freeGB: (freeMem / (1024 ** 3)).toFixed(2),
      usedGB: (usedMem / (1024 ** 3)).toFixed(2)
    },
    loadAverage: os.loadavg(),
    uptime: os.uptime(),
    platform: os.platform(),
    arch: os.arch()
  });
});

// Get network statistics
router.get('/network/stats', (req, res) => {
  const interfaces = os.networkInterfaces();
  const stats = [];

  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        stats.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask,
          mac: iface.mac
        });
      }
    });
  });

  res.json({
    success: true,
    interfaces: stats
  });
});

// Get traffic history
router.get('/traffic/history', (req, res) => {
  const { period = 'day' } = req.query;
  
  // Generate sample traffic history
  const hours = period === 'day' ? 24 : period === 'week' ? 168 : 720;
  const history = [];
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
    history.push({
      timestamp,
      bytesReceived: Math.floor(Math.random() * 100000000),
      bytesSent: Math.floor(Math.random() * 50000000),
      requests: Math.floor(Math.random() * 1000)
    });
  }

  res.json({
    success: true,
    period,
    history
  });
});

// Get performance metrics
router.get('/performance', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    responseTime: {
      avg: Math.floor(Math.random() * 100 + 20),
      min: Math.floor(Math.random() * 50 + 10),
      max: Math.floor(Math.random() * 200 + 100)
    },
    throughput: {
      requestsPerSecond: Math.floor(Math.random() * 1000 + 100),
      bytesPerSecond: Math.floor(Math.random() * 10000000 + 1000000)
    },
    errors: {
      total: Math.floor(Math.random() * 50),
      rate: (Math.random() * 5).toFixed(2) + '%'
    }
  };

  res.json({
    success: true,
    metrics
  });
});

// Get bandwidth usage
router.get('/bandwidth', (req, res) => {
  let totalReceived = 0;
  let totalSent = 0;

  siteMetrics.forEach(metric => {
    totalReceived += metric.bytesReceived;
    totalSent += metric.bytesSent;
  });

  res.json({
    success: true,
    bandwidth: {
      received: totalReceived,
      sent: totalSent,
      total: totalReceived + totalSent,
      receivedMB: (totalReceived / (1024 * 1024)).toFixed(2),
      sentMB: (totalSent / (1024 * 1024)).toFixed(2),
      totalMB: ((totalReceived + totalSent) / (1024 * 1024)).toFixed(2),
      receivedGB: (totalReceived / (1024 ** 3)).toFixed(2),
      sentGB: (totalSent / (1024 ** 3)).toFixed(2),
      totalGB: ((totalReceived + totalSent) / (1024 ** 3)).toFixed(2)
    }
  });
});

// Reset metrics
router.post('/metrics/reset', (req, res) => {
  siteMetrics.clear();
  trafficHistory.clear();
  
  res.json({
    success: true,
    message: 'Metrics reset successfully'
  });
});

// Get active connections
router.get('/connections/active', (req, res) => {
  const connections = [];
  
  siteMetrics.forEach((metric, site) => {
    if (metric.lastRequest && Date.now() - metric.lastRequest < 60000) {
      connections.push({
        site,
        lastRequest: metric.lastRequest,
        requestCount: metric.requestCount
      });
    }
  });

  res.json({
    success: true,
    activeConnections: connections.length,
    connections
  });
});

// Export tracking middleware
router.trackRequest = trackRequest;

module.exports = router;
