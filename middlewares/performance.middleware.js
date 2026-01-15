// Middleware theo dõi performance
const performanceStats = {
  requests: 0,
  totalDuration: 0,
  slowRequests: [],
  endpoints: {}
};

exports.performanceMonitor = (req, res, next) => {
  const start = Date.now();

  // Lưu response.send gốc
  const originalSend = res.send;

  res.send = function(data) {
    const duration = Date.now() - start;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;

    // Cập nhật stats
    performanceStats.requests++;
    performanceStats.totalDuration += duration;

    // Theo dõi từng endpoint
    if (!performanceStats.endpoints[endpoint]) {
      performanceStats.endpoints[endpoint] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0
      };
    }

    const endpointStats = performanceStats.endpoints[endpoint];
    endpointStats.count++;
    endpointStats.totalDuration += duration;
    endpointStats.avgDuration = endpointStats.totalDuration / endpointStats.count;

    // Ghi nhận slow requests (> 1000ms)
    if (duration > 1000) {
      performanceStats.slowRequests.push({
        endpoint,
        duration,
        timestamp: new Date().toISOString(),
        user: req.user?.username || 'anonymous'
      });

      // Giữ tối đa 50 slow requests
      if (performanceStats.slowRequests.length > 50) {
        performanceStats.slowRequests.shift();
      }

      console.warn(`⚠️ SLOW REQUEST: ${endpoint} - ${duration}ms`);
    }

    // Gọi send gốc
    originalSend.call(this, data);
  };

  next();
};

// Lấy performance stats
exports.getPerformanceStats = (req, res) => {
  const avgDuration = performanceStats.requests > 0 
    ? (performanceStats.totalDuration / performanceStats.requests).toFixed(2)
    : 0;

  // Top 10 slowest endpoints
  const slowestEndpoints = Object.entries(performanceStats.endpoints)
    .map(([endpoint, stats]) => ({ endpoint, ...stats }))
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 10);

  res.json({
    overview: {
      totalRequests: performanceStats.requests,
      avgResponseTime: `${avgDuration}ms`,
      slowRequestsCount: performanceStats.slowRequests.length
    },
    slowestEndpoints,
    recentSlowRequests: performanceStats.slowRequests.slice(-10).reverse()
  });
};
