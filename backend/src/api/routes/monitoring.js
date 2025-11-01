import express from 'express';
import { dbAll, dbGet } from '../../database/init.js';

const router = express.Router();

// Get resource metrics for a project
router.get('/resources/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50 } = req.query;

    const metrics = await dbAll(`
      SELECT * FROM resource_metrics 
      WHERE project_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [projectId, parseInt(limit)]);

    res.json({ success: true, data: metrics.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest resource metrics for a project
router.get('/resources/:projectId/latest', async (req, res) => {
  try {
    const { projectId } = req.params;

    const metric = await dbGet(`
      SELECT * FROM resource_metrics 
      WHERE project_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `, [projectId]);

    if (!metric) {
      return res.status(404).json({ success: false, error: 'No metrics found' });
    }

    res.json({ success: true, data: metric });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get HTTP request logs for a project
router.get('/requests/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 100 } = req.query;

    const requests = await dbAll(`
      SELECT * FROM http_requests 
      WHERE project_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [projectId, parseInt(limit)]);

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get error statistics for a project
router.get('/errors/:projectId/stats', async (req, res) => {
  try {
    const { projectId } = req.params;

    const stats = await dbAll(`
      SELECT 
        error_type, 
        COUNT(*) as count,
        MAX(timestamp) as last_occurrence
      FROM error_logs 
      WHERE project_id = ? 
      GROUP BY error_type
      ORDER BY count DESC
    `, [projectId]);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent errors for a project
router.get('/errors/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50 } = req.query;

    const errors = await dbAll(`
      SELECT * FROM error_logs 
      WHERE project_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [projectId, parseInt(limit)]);

    res.json({ success: true, data: errors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get request throughput stats
router.get('/throughput/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { interval = '1 hour' } = req.query;

    // Get request counts grouped by time intervals
    const throughput = await dbAll(`
      SELECT 
        strftime('%Y-%m-%d %H:%M', timestamp) as time_bucket,
        COUNT(*) as request_count,
        AVG(response_time) as avg_response_time
      FROM http_requests 
      WHERE project_id = ? 
        AND timestamp >= datetime('now', '-' || ?)
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `, [projectId, interval]);

    res.json({ success: true, data: throughput });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
