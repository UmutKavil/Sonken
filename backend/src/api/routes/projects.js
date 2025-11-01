import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../../database/init.js';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await dbAll('SELECT * FROM projects ORDER BY created_at DESC');
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const { name, domain, path, php_version, database_name, database_user, database_password } = req.body;
    
    if (!name || !path) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and path are required' 
      });
    }

    const id = uuidv4();
    
    // Domain otomatik oluştur (boşsa)
    const projectDomain = domain || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '.test';
    
    await dbRun(`
      INSERT INTO projects (id, name, domain, path, php_version, database_name, database_user, database_password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, projectDomain, path, php_version || '8.2', database_name, database_user, database_password]);

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, domain, path, php_version, database_name, database_user, database_password, status } = req.body;
    const { id } = req.params;

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    await dbRun(`
      UPDATE projects 
      SET name = COALESCE(?, name),
          domain = COALESCE(?, domain),
          path = COALESCE(?, path),
          php_version = COALESCE(?, php_version),
          database_name = COALESCE(?, database_name),
          database_user = COALESCE(?, database_user),
          database_password = COALESCE(?, database_password),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, domain, path, php_version, database_name, database_user, database_password, status, id]);

    const updatedProject = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    res.json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    await dbRun('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle project status (start/stop)
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const newStatus = project.status === 'running' ? 'stopped' : 'running';
    
    await dbRun('UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);
    
    const updatedProject = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    res.json({ success: true, data: updatedProject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
