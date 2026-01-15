const fs = require('fs');
const path = require('path');

// Tạo thư mục logs nếu chưa có
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Middleware ghi log request
module.exports = (req, res, next) => {
  const start = Date.now();
  
  // Lưu response.send gốc
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      user: req.user ? req.user.username : 'anonymous'
    };
    
    // Ghi vào file log
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    
    // Console log
    console.log(`[${logEntry.timestamp}] ${logEntry.method} ${logEntry.url} - ${logEntry.statusCode} - ${logEntry.duration}`);
    
    // Gọi send gốc
    originalSend.call(this, data);
  };
  
  next();
};
