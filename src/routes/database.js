const express = require('express');
const router = express.Router();
const { getMySQLPool, getMongoDB } = require('../config/database');

// Get MySQL databases
router.get('/mysql/databases', async (req, res) => {
  try {
    const pool = getMySQLPool();
    const [databases] = await pool.query('SHOW DATABASES');
    res.json({ success: true, databases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get MySQL tables from a database
router.get('/mysql/tables/:database', async (req, res) => {
  try {
    const pool = getMySQLPool();
    const { database } = req.params;
    const [tables] = await pool.query(`SHOW TABLES FROM \`${database}\``);
    res.json({ success: true, tables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute MySQL query
router.post('/mysql/query', async (req, res) => {
  try {
    const pool = getMySQLPool();
    const { query } = req.body;
    const [results] = await pool.query(query);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get MongoDB collections
router.get('/mongodb/collections', async (req, res) => {
  try {
    const db = getMongoDB();
    if (!db) {
      return res.status(503).json({ success: false, error: 'MongoDB not connected' });
    }
    const collections = await db.listCollections().toArray();
    res.json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get MongoDB documents from a collection
router.get('/mongodb/documents/:collection', async (req, res) => {
  try {
    const db = getMongoDB();
    if (!db) {
      return res.status(503).json({ success: false, error: 'MongoDB not connected' });
    }
    const { collection } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const documents = await db.collection(collection).find().limit(limit).toArray();
    res.json({ success: true, documents, count: documents.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Database connection test
router.get('/test', async (req, res) => {
  const results = {
    mysql: false,
    mongodb: false
  };

  try {
    const pool = getMySQLPool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    results.mysql = true;
  } catch (error) {
    console.error('MySQL test failed:', error.message);
  }

  try {
    const db = getMongoDB();
    if (db) {
      await db.admin().ping();
      results.mongodb = true;
    }
  } catch (error) {
    console.error('MongoDB test failed:', error.message);
  }

  res.json({
    success: true,
    connections: results
  });
});

module.exports = router;
