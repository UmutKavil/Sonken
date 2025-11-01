import mysql from 'mysql2/promise';
import { dbRun, dbGet } from '../database/init.js';

export class DatabaseMonitor {
  constructor(projectId, wss) {
    this.projectId = projectId;
    this.wss = wss;
    this.interval = null;
    this.connection = null;
    this.monitorInterval = parseInt(process.env.MONITOR_INTERVAL) || 5000;
    this.slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD) || 1000;
  }

  async initConnection() {
    try {
      // Get project database configuration
      const project = await dbGet('SELECT * FROM projects WHERE id = ?', [this.projectId]);
      
      if (!project || !project.database_name) {
        console.log(`No database configured for project ${this.projectId}`);
        return false;
      }

      // Create MySQL connection
      this.connection = await mysql.createConnection({
        host: 'localhost',
        user: project.database_user || 'root',
        password: project.database_password || '',
        database: project.database_name
      });

      return true;
    } catch (error) {
      console.error(`Failed to connect to database for project ${this.projectId}:`, error.message);
      return false;
    }
  }

  async collectMetrics() {
    try {
      if (!this.connection) {
        const connected = await this.initConnection();
        if (!connected) return;
      }

      // Get database size
      const [sizeResult] = await this.connection.query(`
        SELECT 
          SUM(data_length + index_length) / 1024 / 1024 AS size_mb
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
      `);
      const dbSize = sizeResult[0]?.size_mb || 0;

      // Get connection count
      const [connResult] = await this.connection.query(`
        SELECT COUNT(*) as connection_count
        FROM information_schema.processlist
        WHERE db = DATABASE()
      `);
      const connectionCount = connResult[0]?.connection_count || 0;

      // Get slow query count from slow query log (if enabled)
      // This is a simplified version - in production, you'd parse the slow query log
      const slowQueryCount = await this.getSlowQueryCount();

      // Store metrics
      await dbRun(`
        INSERT INTO database_metrics (project_id, db_size, connection_count, slow_queries)
        VALUES (?, ?, ?, ?)
      `, [this.projectId, dbSize.toFixed(2), connectionCount, slowQueryCount]);

      // Broadcast update
      this.broadcast({
        type: 'database_update',
        projectId: this.projectId,
        data: {
          size: dbSize.toFixed(2),
          connections: connectionCount,
          slowQueries: slowQueryCount,
          timestamp: new Date().toISOString()
        }
      });

      // Clean up old metrics
      await this.cleanupOldMetrics();
    } catch (error) {
      console.error(`Error collecting database metrics for project ${this.projectId}:`, error);
      
      // Reset connection on error
      if (this.connection) {
        await this.connection.end().catch(() => {});
        this.connection = null;
      }
    }
  }

  async getSlowQueryCount() {
    try {
      // Query recent slow queries from our tracking table
      const result = await dbGet(`
        SELECT COUNT(*) as count 
        FROM slow_queries 
        WHERE project_id = ? 
        AND timestamp >= datetime('now', '-1 hour')
      `, [this.projectId]);
      
      return result?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  async logSlowQuery(query, executionTime) {
    try {
      await dbRun(`
        INSERT INTO slow_queries (project_id, query, execution_time)
        VALUES (?, ?, ?)
      `, [this.projectId, query, executionTime]);

      this.broadcast({
        type: 'slow_query_detected',
        projectId: this.projectId,
        data: {
          query,
          executionTime,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error logging slow query:', error);
    }
  }

  async cleanupOldMetrics() {
    try {
      // Keep last 1000 metrics
      await dbRun(`
        DELETE FROM database_metrics 
        WHERE project_id = ? 
        AND id NOT IN (
          SELECT id FROM database_metrics 
          WHERE project_id = ? 
          ORDER BY timestamp DESC 
          LIMIT 1000
        )
      `, [this.projectId, this.projectId]);

      // Keep slow queries for 7 days
      await dbRun(`
        DELETE FROM slow_queries 
        WHERE project_id = ? 
        AND timestamp < datetime('now', '-7 days')
      `, [this.projectId]);
    } catch (error) {
      console.error('Error cleaning up old database metrics:', error);
    }
  }

  broadcast(message) {
    if (!this.wss) return;
    
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  }

  start() {
    if (this.interval) {
      console.log(`Database monitor already running for project ${this.projectId}`);
      return;
    }

    this.interval = setInterval(() => {
      this.collectMetrics();
    }, this.monitorInterval);

    // Collect initial metrics
    this.collectMetrics();
  }

  async stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    if (this.connection) {
      await this.connection.end().catch(() => {});
      this.connection = null;
    }

    console.log(`Database monitor stopped for project ${this.projectId}`);
  }
}
