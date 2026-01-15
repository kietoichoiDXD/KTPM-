const mongoose = require('mongoose');
const os = require('os');

// Health check endpoint
exports.healthCheck = async (req, res) => {
  try {
    // Kiểm tra MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // System info
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      uptime: `${(os.uptime() / 3600).toFixed(2)} hours`
    };

    // Process info
    const processInfo = {
      nodeVersion: process.version,
      pid: process.pid,
      uptime: `${(process.uptime() / 3600).toFixed(2)} hours`,
      memoryUsage: {
        rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
      }
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name
      },
      system: systemInfo,
      process: processInfo
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
};

// Ping endpoint
exports.ping = (req, res) => {
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
};
