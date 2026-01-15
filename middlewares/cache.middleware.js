// Simple in-memory cache
const cache = new Map();

// Cache middleware
exports.cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Chỉ cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      const { data, timestamp } = cachedResponse;
      const age = (Date.now() - timestamp) / 1000;

      // Kiểm tra cache còn hiệu lực
      if (age < duration) {
        console.log(`✅ Cache HIT: ${key} (age: ${age.toFixed(2)}s)`);
        return res.json(data);
      } else {
        // Cache hết hạn
        cache.delete(key);
      }
    }

    console.log(`❌ Cache MISS: ${key}`);

    // Lưu response.json gốc
    const originalJson = res.json.bind(res);

    // Override res.json để cache response
    res.json = (data) => {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return originalJson(data);
    };

    next();
  };
};

// Clear cache
exports.clearCache = () => {
  cache.clear();
  console.log('🗑️ Cache cleared');
};

// Clear specific cache
exports.clearCacheByPattern = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};
