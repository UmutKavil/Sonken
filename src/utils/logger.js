const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'sonken.log');

const logger = {
  info: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [INFO] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.log(chalk.blue(`[INFO]`), message);
  },

  error: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [ERROR] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.error(chalk.red(`[ERROR]`), message);
  },

  warn: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [WARN] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.warn(chalk.yellow(`[WARN]`), message);
  },

  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [DEBUG] ${message}\n`;
      fs.appendFileSync(logFile, logMessage);
      console.log(chalk.gray(`[DEBUG]`), message);
    }
  }
};

module.exports = logger;
