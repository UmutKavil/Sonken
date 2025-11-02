import express from 'express';
import os from 'os';
import si from 'systeminformation';

const router = express.Router();

// Get overall system information
router.get('/info', async (req, res) => {
  try {
    const [cpu, mem, osInfo, diskLayout] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.diskLayout()
    ]);

    const systemInfo = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        active: mem.active,
        available: mem.available
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: osInfo.hostname
      },
      disk: diskLayout.map(disk => ({
        name: disk.name,
        type: disk.type,
        size: disk.size,
        vendor: disk.vendor
      }))
    };

    res.json({ success: true, data: systemInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current system resource usage
router.get('/resources', async (req, res) => {
  try {
    const [cpuLoad, mem, fsSize] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize()
    ]);

    const resources = {
      cpu: {
        usage: cpuLoad.currentLoad.toFixed(2),
        idle: cpuLoad.currentLoadIdle.toFixed(2),
        cores: cpuLoad.cpus.map(core => ({
          load: core.load.toFixed(2)
        }))
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usagePercent: ((mem.used / mem.total) * 100).toFixed(2)
      },
      disk: fsSize.map(fs => ({
        fs: fs.fs,
        type: fs.type,
        size: fs.size,
        used: fs.used,
        available: fs.available,
        usagePercent: fs.use
      }))
    };

    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get network information
router.get('/network', async (req, res) => {
  try {
    const [networkInterfaces, networkStats] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats()
    ]);

    res.json({ 
      success: true, 
      data: {
        interfaces: networkInterfaces,
        stats: networkStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Select folder dialog (uses native OS file picker via child_process)
router.post('/select-folder', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Windows için PowerShell kullanarak klasör seçici açıyoruz
    if (os.platform() === 'win32') {
      try {
        // PowerShell scriptini dosyaya yaz ve çalıştır
        const fs = await import('fs');
        const path = await import('path');
        const tempDir = os.tmpdir();
        const scriptPath = path.join(tempDir, 'select-folder.ps1');
        
        const psScript = `
Add-Type -AssemblyName System.Windows.Forms
$folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
$folderBrowser.Description = 'Proje klasörünü seçin'
$folderBrowser.RootFolder = 'MyComputer'
$result = $folderBrowser.ShowDialog()
if ($result -eq 'OK') {
    Write-Output $folderBrowser.SelectedPath
}
`;
        
        fs.writeFileSync(scriptPath, psScript, 'utf8');
        
        const { stdout } = await execAsync(
          `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`,
          { encoding: 'utf8', timeout: 60000 }
        );

        const selectedPath = stdout.trim();
        
        // Temp dosyayı sil
        try { fs.unlinkSync(scriptPath); } catch(e) {}
        
        if (selectedPath && selectedPath.length > 0) {
          res.json({
            success: true,
            path: selectedPath
          });
        } else {
          res.json({
            success: false,
            canceled: true,
            message: 'Klasör seçimi iptal edildi'
          });
        }
      } catch (psError) {
        console.error('PowerShell error:', psError);
        res.json({
          success: false,
          error: 'Klasör seçici açılamadı: ' + psError.message
        });
      }
    } else if (os.platform() === 'darwin') {
      // macOS için AppleScript kullanarak Finder dialog açıyoruz
      try {
        const appleScriptCommand = `osascript -e 'return POSIX path of (choose folder with prompt "Proje klasörünü seçin")'`;
        
        console.log('Executing AppleScript:', appleScriptCommand);
        
        const { stdout, stderr } = await execAsync(appleScriptCommand, {
          encoding: 'utf8',
          timeout: 60000
        });

        console.log('AppleScript stdout:', stdout);
        console.log('AppleScript stderr:', stderr);

        const selectedPath = stdout.trim();
        
        if (selectedPath && selectedPath.length > 0 && !selectedPath.includes('execution error')) {
          console.log('Selected path:', selectedPath);
          res.json({
            success: true,
            path: selectedPath
          });
        } else {
          console.log('No path selected or error');
          res.json({
            success: false,
            canceled: true,
            message: 'Klasör seçimi iptal edildi'
          });
        }
      } catch (macError) {
        console.error('AppleScript error details:', {
          message: macError.message,
          code: macError.code,
          stderr: macError.stderr,
          stdout: macError.stdout
        });
        
        // User cancelled the dialog (exit code 1 or -128)
        if (macError.code === 1 || macError.code === 128) {
          res.json({
            success: false,
            canceled: true,
            message: 'Klasör seçimi iptal edildi'
          });
        } else {
          res.json({
            success: false,
            error: 'Klasör seçici açılamadı. Lütfen yolu manuel olarak girin.'
          });
        }
      }
    } else if (os.platform() === 'linux') {
      // Linux için zenity kullanıyoruz (çoğu Linux dağıtımında yüklü)
      try {
        const { stdout } = await execAsync(
          'zenity --file-selection --directory --title="Proje klasörünü seçin"',
          { encoding: 'utf8', timeout: 60000 }
        );

        const selectedPath = stdout.trim();
        
        if (selectedPath && selectedPath.length > 0) {
          res.json({
            success: true,
            path: selectedPath
          });
        } else {
          res.json({
            success: false,
            canceled: true,
            message: 'Klasör seçimi iptal edildi'
          });
        }
      } catch (linuxError) {
        // User cancelled or zenity not installed
        if (linuxError.code === 1) {
          res.json({
            success: false,
            canceled: true,
            message: 'Klasör seçimi iptal edildi'
          });
        } else {
          console.error('Zenity error:', linuxError);
          res.json({
            success: false,
            error: 'Klasör seçici açılamadı. Zenity yüklü değil olabilir. Lütfen yolu manuel olarak girin.'
          });
        }
      }
    } else {
      res.json({
        success: false,
        error: 'Bu platform için klasör seçici desteklenmiyor. Lütfen yolu manuel olarak girin.'
      });
    }
  } catch (error) {
    console.error('Error selecting folder:', error);
    res.json({
      success: false,
      error: error.message
    });
  }
});

export default router;
