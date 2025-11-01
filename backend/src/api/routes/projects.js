import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbAll } from '../../database/init.js';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const router = express.Router();
const execAsync = promisify(exec);

// Dosyaları kopyala
async function copyProjectFiles(sourcePath, projectId, projectName) {
  try {
    // Sonken projeleri için klasör oluştur
    const sonkenProjectsDir = path.join(process.cwd(), '..', 'sonken-projects');
    
    // Ana klasör yoksa oluştur
    if (!fs.existsSync(sonkenProjectsDir)) {
      fs.mkdirSync(sonkenProjectsDir, { recursive: true });
    }
    
    // Proje adından güvenli klasör adı oluştur
    const safeFolderName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const destinationPath = path.join(sonkenProjectsDir, `${safeFolderName}-${projectId.substring(0, 8)}`);
    
    // Hedef klasör varsa sil
    if (fs.existsSync(destinationPath)) {
      fs.rmSync(destinationPath, { recursive: true, force: true });
    }
    
    // Yeni klasör oluştur
    fs.mkdirSync(destinationPath, { recursive: true });
    
    // Windows'ta robocopy kullan (daha hızlı ve güvenilir)
    if (process.platform === 'win32') {
      const command = `robocopy "${sourcePath}" "${destinationPath}" /E /NFL /NDL /NJH /NJS /nc /ns /np`;
      try {
        const { stdout, stderr } = await execAsync(command);
        console.log('Robocopy completed:', stdout);
      } catch (error) {
        // Robocopy exit codes: 0-7 başarılı (ama exception oluşturur), 8+ gerçek hata
        // Exit code 1 = Dosyalar kopyalandı (başarılı)
        // Exit code 2 = Ekstra dosyalar var (başarılı)
        // Exit code 3 = Dosyalar kopyalandı ve ekstra dosyalar var (başarılı)
        const exitCode = error.code || 0;
        if (exitCode >= 8) {
          console.error('Robocopy failed with code:', exitCode);
          throw new Error(`Failed to copy files: ${error.message}`);
        }
        // Exit code 1-7 başarılı kabul edilir
        console.log('Robocopy completed with code:', exitCode);
      }
    } else {
      // Unix/Linux için cp kullan
      await execAsync(`cp -R "${sourcePath}/." "${destinationPath}"`);
    }
    
    return destinationPath;
  } catch (error) {
    console.error('Error copying project files:', error);
    throw error;
  }
}

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
    const { name, domain, path: sourcePath, php_version, database_name, database_user, database_password } = req.body;
    
    if (!name || !sourcePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and path are required' 
      });
    }

    // Kaynak klasör var mı kontrol et
    if (!fs.existsSync(sourcePath)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Source path does not exist' 
      });
    }

    const id = uuidv4();
    
    // Domain otomatik oluştur (boşsa)
    const projectDomain = domain || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '.test';
    
    // Dosyaları kopyala
    let copiedPath;
    try {
      copiedPath = await copyProjectFiles(sourcePath, id, name);
    } catch (copyError) {
      console.error('Copy error:', copyError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to copy project files: ' + copyError.message 
      });
    }
    
    // Veritabanına kopyalanan yolu kaydet
    await dbRun(`
      INSERT INTO projects (id, name, domain, path, php_version, database_name, database_user, database_password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, projectDomain, copiedPath, php_version || '8.2', database_name, database_user, database_password]);

    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json({ 
      success: true, 
      data: project,
      message: `Proje dosyaları kopyalandı: ${copiedPath}`,
      originalPath: sourcePath,
      copiedPath: copiedPath
    });
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

// Refresh project files (re-copy from original source)
router.post('/:id/refresh', async (req, res) => {
  try {
    const { id } = req.params;
    const { sourcePath } = req.body;
    
    const project = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Kaynak yol belirtilmemişse hata ver
    if (!sourcePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Source path is required for refresh' 
      });
    }

    // Kaynak klasör var mı kontrol et
    if (!fs.existsSync(sourcePath)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Source path does not exist' 
      });
    }

    // Mevcut kopyalanmış klasörü sil
    if (fs.existsSync(project.path)) {
      fs.rmSync(project.path, { recursive: true, force: true });
    }

    // Dosyaları yeniden kopyala
    let copiedPath;
    try {
      copiedPath = await copyProjectFiles(sourcePath, id, project.name);
    } catch (copyError) {
      console.error('Refresh copy error:', copyError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to refresh project files: ' + copyError.message 
      });
    }

    // Veritabanında yolu güncelle
    await dbRun(`
      UPDATE projects 
      SET path = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [copiedPath, id]);

    const updatedProject = await dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    res.json({ 
      success: true, 
      data: updatedProject,
      message: 'Proje dosyaları yeniden kopyalandı',
      copiedPath: copiedPath
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
