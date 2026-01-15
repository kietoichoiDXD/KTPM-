require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Security Middleware
const { securityHeaders, sanitizeInput } = require('./middlewares/security.middleware');
app.use(securityHeaders);
app.use(sanitizeInput);

// Logger Middleware
app.use(require('./middlewares/logger.middleware'));

// Performance Monitor
const { performanceMonitor } = require('./middlewares/performance.middleware');
app.use(performanceMonitor);

// Rate Limiter
const rateLimiter = require('./middlewares/rateLimiter.middleware');
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API is running!',
    version: '4.0',
    features: [
      'Authentication & Authorization',
      'Student & Course Management',
      'Attendance Tracking',
      'Grade Management',
      'Statistics & Analytics',
      'Export Data (CSV/JSON)',
      'Search & Filter',
      'Backup & Restore',
      'Notifications',
      'Performance Monitoring',
      'Health Check'
    ],
    endpoints: {
      auth: '/auth',
      profile: '/profile',
      students: '/students',
      courses: '/courses',
      attendance: '/attendance',
      grades: '/grades',
      notifications: '/notifications',
      stats: '/stats',
      export: '/export',
      search: '/search',
      backup: '/backup',
      analytics: '/analytics',
      health: '/health',
      performance: '/performance'
    }
  });
});

app.use('/auth', require('./routes/auth.routes'));
app.use('/profile', require('./routes/profile.routes'));
app.use('/students', require('./routes/student.routes'));
app.use('/courses', require('./routes/course.routes'));
app.use('/attendance', require('./routes/attendance.routes'));
app.use('/grades', require('./routes/grade.routes'));
app.use('/notifications', require('./routes/notification.routes'));
app.use('/stats', require('./routes/stats.routes'));
app.use('/export', require('./routes/export.routes'));
app.use('/search', require('./routes/search.routes'));
app.use('/backup', require('./routes/backup.routes'));
app.use('/analytics', require('./routes/analytics.routes'));
app.use('/health', require('./routes/health.routes'));

// Performance stats endpoint
const { getPerformanceStats } = require('./middlewares/performance.middleware');
app.get('/performance', getPerformanceStats);

// Error Handler Middleware
app.use(require('./middlewares/error.middleware'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`⚡ Performance Stats: http://localhost:${PORT}/performance`);
});
