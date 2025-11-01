import express from 'express';
import { spawn } from 'child_process';
import { dbGet, dbRun } from '../../database/init.js';

const router = express.Router();
const activeServers = new Map(); // projectId -> process

// Start local server for a project
router.post('/start/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { port } = req.body;
    
    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [projectId]);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check if server already running
    if (activeServers.has(projectId)) {
      return res.json({ 
        success: true, 
        message: 'Server already running',
        port: activeServers.get(projectId).port 
      });
    }

    const serverPort = port || 8000 + Math.floor(Math.random() * 1000);
    
    // Start PHP built-in server
    const phpServer = spawn('php', [
      '-S',
      `0.0.0.0:${serverPort}`,
      '-t',
      project.path
    ], {
      cwd: project.path
    });

    phpServer.stdout.on('data', (data) => {
      console.log(`[PHP Server ${projectId}]: ${data}`);
    });

    phpServer.stderr.on('data', (data) => {
      console.log(`[PHP Server ${projectId}]: ${data}`);
    });

    phpServer.on('close', (code) => {
      console.log(`PHP server for project ${projectId} stopped with code ${code}`);
      activeServers.delete(projectId);
    });

    activeServers.set(projectId, {
      process: phpServer,
      port: serverPort,
      path: project.path
    });

    // Update project status
    await dbRun('UPDATE projects SET status = ? WHERE id = ?', ['running', projectId]);

    res.json({ 
      success: true, 
      message: 'Server started successfully',
      port: serverPort,
      url: `http://localhost:${serverPort}`
    });
  } catch (error) {
    console.error('Error starting server:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stop local server for a project
router.post('/stop/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!activeServers.has(projectId)) {
      return res.json({ success: true, message: 'Server not running' });
    }

    const serverInfo = activeServers.get(projectId);
    serverInfo.process.kill();
    activeServers.delete(projectId);

    // Update project status
    await dbRun('UPDATE projects SET status = ? WHERE id = ?', ['stopped', projectId]);

    res.json({ success: true, message: 'Server stopped successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get server status
router.get('/status/:projectId', (req, res) => {
  const { projectId } = req.params;
  
  if (activeServers.has(projectId)) {
    const serverInfo = activeServers.get(projectId);
    res.json({ 
      success: true, 
      running: true,
      port: serverInfo.port,
      url: `http://localhost:${serverInfo.port}`
    });
  } else {
    res.json({ success: true, running: false });
  }
});

// Get local IP address
router.get('/network-ip', (req, res) => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push({
          interface: name,
          address: net.address
        });
      }
    }
  }

  res.json({ success: true, data: results });
});

export default router;
