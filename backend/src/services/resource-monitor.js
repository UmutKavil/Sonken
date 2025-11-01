import si from 'systeminformation';
import { dbRun } from '../database/init.js';

export class ResourceMonitor {
  constructor(projectId, wss) {
    this.projectId = projectId;
    this.wss = wss;
    this.interval = null;
    this.monitorInterval = parseInt(process.env.MONITOR_INTERVAL) || 2000;
  }

  async collectMetrics() {
    try {
      const [cpuLoad, mem, fsSize] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize()
      ]);

      // Calculate metrics
      const cpuUsage = cpuLoad.currentLoad;
      const memoryUsage = (mem.used / mem.total) * 100;
      
      // Get disk usage for the main filesystem
      const diskUsage = fsSize.length > 0 ? fsSize[0].use : 0;

      // Store metrics in database
      await dbRun(`
        INSERT INTO resource_metrics (project_id, cpu_usage, memory_usage, disk_usage)
        VALUES (?, ?, ?, ?)
      `, [this.projectId, cpuUsage.toFixed(2), memoryUsage.toFixed(2), diskUsage.toFixed(2)]);

      // Send real-time update via WebSocket
      this.broadcast({
        type: 'resource_update',
        projectId: this.projectId,
        data: {
          cpu: cpuUsage.toFixed(2),
          memory: memoryUsage.toFixed(2),
          disk: diskUsage.toFixed(2),
          timestamp: new Date().toISOString()
        }
      });

      // Clean up old metrics (keep last 1000 records per project)
      await this.cleanupOldMetrics();
    } catch (error) {
      console.error(`Error collecting metrics for project ${this.projectId}:`, error);
    }
  }

  async cleanupOldMetrics() {
    try {
      await dbRun(`
        DELETE FROM resource_metrics 
        WHERE project_id = ? 
        AND id NOT IN (
          SELECT id FROM resource_metrics 
          WHERE project_id = ? 
          ORDER BY timestamp DESC 
          LIMIT 1000
        )
      `, [this.projectId, this.projectId]);
    } catch (error) {
      console.error('Error cleaning up old metrics:', error);
    }
  }

  broadcast(message) {
    if (!this.wss) return;
    
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(message));
      }
    });
  }

  start() {
    if (this.interval) {
      console.log(`Resource monitor already running for project ${this.projectId}`);
      return;
    }

    this.interval = setInterval(() => {
      this.collectMetrics();
    }, this.monitorInterval);

    // Collect initial metrics
    this.collectMetrics();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log(`Resource monitor stopped for project ${this.projectId}`);
    }
  }
}
