const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const unzipper = require('unzipper');

// Sites directory
const sitesDir = path.join(__dirname, '../../sites');
const sitesDataFile = path.join(__dirname, '../../sites/sites.json');

// Create sites directory if not exists
if (!fs.existsSync(sitesDir)) {
  fs.mkdirSync(sitesDir, { recursive: true });
}

// Initialize sites data file
if (!fs.existsSync(sitesDataFile)) {
  fs.writeFileSync(sitesDataFile, JSON.stringify({ sites: [] }, null, 2));
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const siteName = req.body.siteName || 'temp';
    const siteDir = path.join(sitesDir, siteName);
    
    if (!fs.existsSync(siteDir)) {
      fs.mkdirSync(siteDir, { recursive: true });
    }
    
    cb(null, siteDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Get local network IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    });
  });
  
  return ips;
}

// Read sites data
function getSitesData() {
  try {
    const data = fs.readFileSync(sitesDataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { sites: [] };
  }
}

// Write sites data
function saveSitesData(data) {
  fs.writeFileSync(sitesDataFile, JSON.stringify(data, null, 2));
}

// Find available port
function findAvailablePort(startPort = 8000) {
  const sitesData = getSitesData();
  const usedPorts = sitesData.sites.map(s => s.port);
  
  let port = startPort;
  while (usedPorts.includes(port)) {
    port++;
  }
  
  return port;
}

// Upload site
router.post('/upload', upload.array('siteFiles', 50), async (req, res) => {
  try {
    const { siteName, port: requestedPort } = req.body;
    const files = req.files;
    
    if (!siteName) {
      return res.status(400).json({ success: false, error: 'Site adı gerekli' });
    }
    
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'Dosya yüklenmedi' });
    }
    
    const siteDir = path.join(sitesDir, siteName);
    
    // Extract ZIP files if any
    for (const file of files) {
      if (file.originalname.endsWith('.zip')) {
        const zipPath = path.join(siteDir, file.originalname);
        
        await fs.createReadStream(zipPath)
          .pipe(unzipper.Extract({ path: siteDir }))
          .promise();
        
        // Remove the zip file after extraction
        fs.unlinkSync(zipPath);
      }
    }
    
    // Find available port
    const port = requestedPort ? parseInt(requestedPort) : findAvailablePort();
    
    // Get network IPs
    const localIPs = getLocalIPs();
    const networkUrls = [
      `http://localhost:${port}`,
      ...localIPs.map(ip => `http://${ip}:${port}`)
    ];
    
    // Count files
    const fileCount = fs.readdirSync(siteDir).length;
    
    // Save site info
    const sitesData = getSitesData();
    const existingSiteIndex = sitesData.sites.findIndex(s => s.name === siteName);
    
    const siteInfo = {
      name: siteName,
      port: port,
      path: siteDir,
      localUrl: `http://localhost:${port}`,
      networkUrls: networkUrls,
      fileCount: fileCount,
      status: 'running',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (existingSiteIndex >= 0) {
      sitesData.sites[existingSiteIndex] = siteInfo;
    } else {
      sitesData.sites.push(siteInfo);
    }
    
    saveSitesData(sitesData);
    
    res.json({
      success: true,
      message: 'Site başarıyla yüklendi',
      site: siteInfo,
      networkUrls: networkUrls
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Site yüklenirken hata oluştu: ' + error.message 
    });
  }
});

// List sites
router.get('/list', (req, res) => {
  try {
    const sitesData = getSitesData();
    
    // Update network URLs for each site
    const localIPs = getLocalIPs();
    sitesData.sites.forEach(site => {
      site.networkUrls = [
        `http://localhost:${site.port}`,
        ...localIPs.map(ip => `http://${ip}:${site.port}`)
      ];
    });
    
    res.json({
      success: true,
      sites: sitesData.sites
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get site details
router.get('/:siteName', (req, res) => {
  try {
    const { siteName } = req.params;
    const sitesData = getSitesData();
    const site = sitesData.sites.find(s => s.name === siteName);
    
    if (!site) {
      return res.status(404).json({ 
        success: false, 
        error: 'Site bulunamadı' 
      });
    }
    
    res.json({
      success: true,
      site: site
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete site
router.post('/delete', (req, res) => {
  try {
    const { siteName } = req.body;
    
    if (!siteName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Site adı gerekli' 
      });
    }
    
    const sitesData = getSitesData();
    const siteIndex = sitesData.sites.findIndex(s => s.name === siteName);
    
    if (siteIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Site bulunamadı' 
      });
    }
    
    const site = sitesData.sites[siteIndex];
    const siteDir = site.path;
    
    // Delete site directory
    if (fs.existsSync(siteDir)) {
      fs.rmSync(siteDir, { recursive: true, force: true });
    }
    
    // Remove from sites list
    sitesData.sites.splice(siteIndex, 1);
    saveSitesData(sitesData);
    
    res.json({
      success: true,
      message: 'Site silindi'
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
