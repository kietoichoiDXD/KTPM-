const rateLimit = new Map();

// Giới hạn số request
module.exports = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 phút
  const max = options.max || 100; // 100 requests

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!rateLimit.has(key)) {
      rateLimit.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    const record = rateLimit.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= max) {
      return res.status(429).json({
        message: 'Quá nhiều request, vui lòng thử lại sau',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
};
