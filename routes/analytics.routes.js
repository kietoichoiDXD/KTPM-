const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /analytics/growth - Xu hướng tăng trưởng (ADMIN)
router.get('/growth',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  analyticsController.getGrowthTrends
);

// GET /analytics/age - Phân tích độ tuổi (ADMIN)
router.get('/age',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  analyticsController.getAgeAnalytics
);

// GET /analytics/top-courses - Top khóa học (ADMIN)
router.get('/top-courses',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  analyticsController.getTopCourses
);

module.exports = router;
