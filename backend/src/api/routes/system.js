import express from 'express';
import os from 'os';
import si from 'systeminformation';

const router = express.Router();

// Get overall system information
router.get('/info', async (req, res) => {
  try {
    const [cpu, mem, osInfo, diskLayout] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.diskLayout()
    ]);

    const systemInfo = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        active: mem.active,
        available: mem.available
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname
      },
      disk: diskLayout.map(disk => ({
        name: disk.name,
        type: disk.type,
        size: disk.size,
        vendor: disk.vendor
      }))
    };

    res.json({ success: true, data: systemInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current system resource usage
router.get('/resources', async (req, res) => {
  try {
    const [cpuLoad, mem, fsSize] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize()
    ]);

    const resources = {
      cpu: {
        usage: cpuLoad.currentLoad.toFixed(2),
        idle: cpuLoad.currentLoadIdle.toFixed(2),
        cores: cpuLoad.cpus.map(core => ({
          load: core.load.toFixed(2)
        }))
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usagePercent: ((mem.used / mem.total) * 100).toFixed(2)
      },
      disk: fsSize.map(fs => ({
        fs: fs.fs,
        type: fs.type,
        size: fs.size,
        used: fs.used,
        available: fs.available,
        usagePercent: fs.use
      }))
    };

    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get network information
router.get('/network', async (req, res) => {
  try {
    const [networkInterfaces, networkStats] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats()
    ]);

    res.json({ 
      success: true, 
      data: {
        interfaces: networkInterfaces,
        stats: networkStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
