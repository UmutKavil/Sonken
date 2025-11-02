import express from 'express';
import fs from 'fs';
import path from 'path';
import { dbGet } from '../../database/init.js';
import { joinPaths, normalizePath } from '../../utils/platform.js';

const router = express.Router();

// Get PHP files in project directory
router.get('/php-files/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [projectId]);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const projectPath = project.path;
    
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ success: false, error: 'Project path does not exist' });
    }

    // Recursive function to find PHP files
    const findPhpFiles = (dir, baseDir = dir) => {
      let phpFiles = [];
      
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = joinPaths(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Skip node_modules, vendor, .git directories
            if (!['node_modules', 'vendor', '.git', '.vscode'].includes(item)) {
              phpFiles = phpFiles.concat(findPhpFiles(fullPath, baseDir));
            }
          } else if (item.endsWith('.php')) {
            const relativePath = normalizePath(path.relative(baseDir, fullPath));
            phpFiles.push({
              name: item,
              path: relativePath,
              fullPath: normalizePath(fullPath),
              size: stat.size,
              modified: stat.mtime
            });
          }
        }
      } catch (error) {
        console.error('Error reading directory:', error);
      }
      
      return phpFiles;
    };

    const phpFiles = findPhpFiles(projectPath);
    
    res.json({ 
      success: true, 
      data: {
        files: phpFiles,
        projectPath: projectPath,
        domain: project.domain
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get file content
router.get('/file-content/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ success: false, error: 'File path is required' });
    }

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [projectId]);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const fullPath = normalizePath(joinPaths(project.path, filePath));
    const normalizedProjectPath = normalizePath(project.path);
    
    // Security check: make sure file is within project directory
    if (!fullPath.startsWith(normalizedProjectPath)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    
    res.json({ 
      success: true, 
      data: {
        content,
        path: filePath
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
