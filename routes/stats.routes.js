const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /stats/dashboard - Thống kê tổng quan (chỉ ADMIN)
router.get('/dashboard', 
  authMiddleware, 
  roleMiddleware(['ADMIN']),
  statsController.getDashboardStats
);

// GET /stats/students - Thống kê sinh viên (chỉ ADMIN)
router.get('/students',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  statsController.getStudentStats
);

module.exports = router;
