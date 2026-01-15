const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /export/students/csv - Export sinh viên CSV (chỉ ADMIN)
router.get('/students/csv',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  exportController.exportStudentsCSV
);

// GET /export/courses/csv - Export khóa học CSV (chỉ ADMIN)
router.get('/courses/csv',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  exportController.exportCoursesCSV
);

// GET /export/:type/json - Export JSON (chỉ ADMIN)
router.get('/:type/json',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  exportController.exportJSON
);

module.exports = router;
