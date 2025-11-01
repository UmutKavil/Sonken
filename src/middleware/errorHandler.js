const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);

  // Default error status
  const status = err.status || err.statusCode || 500;

  // Send error response
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: status,
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
};

module.exports = errorHandler;
