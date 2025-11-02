/**
 * Cross-platform utility functions
 * Provides platform-specific implementations for Windows and Unix systems
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Check if running on Windows
 */
export const isWindows = () => process.platform === 'win32';

/**
 * Check if running on macOS
 */
export const isMacOS = () => process.platform === 'darwin';

/**
 * Check if running on Linux
 */
export const isLinux = () => process.platform === 'linux';

/**
 * Get platform name
 */
export const getPlatform = () => {
  if (isWindows()) return 'windows';
  if (isMacOS()) return 'macos';
  if (isLinux()) return 'linux';
  return 'unknown';
};

/**
 * Copy directory with platform-specific commands
 * @param {string} source - Source directory path
 * @param {string} destination - Destination directory path
 * @returns {Promise<void>}
 */
export const copyDirectory = async (source, destination) => {
  try {
    if (isWindows()) {
      // Windows: Use robocopy for efficient copying
      const command = `robocopy "${source}" "${destination}" /E /NFL /NDL /NJH /NJS /nc /ns /np`;
      try {
        await execAsync(command);
      } catch (error) {
        // Robocopy exit codes: 0-7 are success, 8+ are errors
        const exitCode = error.code || 0;
        if (exitCode >= 8) {
          throw new Error(`Failed to copy directory: ${error.message}`);
        }
        // Exit codes 1-7 are considered successful
        console.log(`Directory copied successfully (exit code: ${exitCode})`);
      }
    } else {
      // Unix/Linux/macOS: Use cp command
      const command = `cp -R "${source}/." "${destination}"`;
      await execAsync(command);
    }
  } catch (error) {
    console.error('Error copying directory:', error);
    throw error;
  }
};

/**
 * Get home directory path
 * @returns {string}
 */
export const getHomeDir = () => {
  return os.homedir();
};

/**
 * Get temporary directory path
 * @returns {string}
 */
export const getTempDir = () => {
  return os.tmpdir();
};

/**
 * Normalize path for current platform
 * @param {string} filepath - Path to normalize
 * @returns {string}
 */
export const normalizePath = (filepath) => {
  return path.normalize(filepath);
};

/**
 * Join paths using platform-specific separator
 * @param {...string} paths - Paths to join
 * @returns {string}
 */
export const joinPaths = (...paths) => {
  return path.join(...paths);
};

/**
 * Get platform-specific line ending
 * @returns {string}
 */
export const getLineEnding = () => {
  return isWindows() ? '\r\n' : '\n';
};

/**
 * Get platform-specific path separator
 * @returns {string}
 */
export const getPathSeparator = () => {
  return path.sep;
};

/**
 * Convert Windows path to Unix path (useful for WSL)
 * @param {string} windowsPath - Windows path
 * @returns {string}
 */
export const windowsToUnixPath = (windowsPath) => {
  return windowsPath.replace(/\\/g, '/');
};

/**
 * Convert Unix path to Windows path
 * @param {string} unixPath - Unix path
 * @returns {string}
 */
export const unixToWindowsPath = (unixPath) => {
  return unixPath.replace(/\//g, '\\');
};

/**
 * Get environment variable value
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string}
 */
export const getEnvVar = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

/**
 * Get system info
 * @returns {Object}
 */
export const getSystemInfo = () => {
  return {
    platform: getPlatform(),
    isWindows: isWindows(),
    isMacOS: isMacOS(),
    isLinux: isLinux(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    homeDir: getHomeDir(),
    tempDir: getTempDir(),
    hostname: os.hostname(),
    nodeVersion: process.version
  };
};

/**
 * Execute command with platform-specific shell
 * @param {string} command - Command to execute
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
export const executeCommand = async (command) => {
  const shell = isWindows() ? 'cmd.exe' : '/bin/sh';
  return await execAsync(command, { shell });
};

/**
 * Kill process by PID (cross-platform)
 * @param {number} pid - Process ID
 * @returns {Promise<void>}
 */
export const killProcess = async (pid) => {
  try {
    if (isWindows()) {
      await execAsync(`taskkill /PID ${pid} /F`);
    } else {
      await execAsync(`kill -9 ${pid}`);
    }
  } catch (error) {
    console.error(`Error killing process ${pid}:`, error);
    throw error;
  }
};

/**
 * Find process by port (cross-platform)
 * @param {number} port - Port number
 * @returns {Promise<number|null>} - Process ID or null
 */
export const findProcessByPort = async (port) => {
  try {
    if (isWindows()) {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n');
      if (lines.length > 0) {
        const parts = lines[0].trim().split(/\s+/);
        return parseInt(parts[parts.length - 1]);
      }
    } else {
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pid = parseInt(stdout.trim());
      return isNaN(pid) ? null : pid;
    }
  } catch (error) {
    return null;
  }
};

export default {
  isWindows,
  isMacOS,
  isLinux,
  getPlatform,
  copyDirectory,
  getHomeDir,
  getTempDir,
  normalizePath,
  joinPaths,
  getLineEnding,
  getPathSeparator,
  windowsToUnixPath,
  unixToWindowsPath,
  getEnvVar,
  getSystemInfo,
  executeCommand,
  killProcess,
  findProcessByPort
};
