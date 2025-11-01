import express from 'express';
import { dbAll, dbGet } from '../../database/init.js';

const router = express.Router();

// Get database metrics for a project
router.get('/metrics/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50 } = req.query;

    const metrics = await dbAll(`
      SELECT * FROM database_metrics 
      WHERE project_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [projectId, parseInt(limit)]);

    res.json({ success: true, data: metrics.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest database metrics
router.get('/metrics/:projectId/latest', async (req, res) => {
  try {
    const { projectId } = req.params;

    const metric = await dbGet(`
      SELECT * FROM database_metrics 
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

// Get slow queries for a project
router.get('/slow-queries/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 20 } = req.query;

    const queries = await dbAll(`
      SELECT * FROM slow_queries 
      WHERE project_id = ? 
      ORDER BY execution_time DESC 
      LIMIT ?
    `, [projectId, parseInt(limit)]);

    res.json({ success: true, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get slow query statistics
router.get('/slow-queries/:projectId/stats', async (req, res) => {
  try {
    const { projectId } = req.params;

    const stats = await dbGet(`
      SELECT 
        COUNT(*) as total_slow_queries,
        AVG(execution_time) as avg_execution_time,
        MAX(execution_time) as max_execution_time,
        MIN(execution_time) as min_execution_time
      FROM slow_queries 
      WHERE project_id = ?
    `, [projectId]);

    res.json({ success: true, data: stats || { total_slow_queries: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
