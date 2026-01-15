const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// POST /attendance - Điểm danh (ADMIN)
router.post('/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  attendanceController.markAttendance
);

// GET /attendance - Lấy danh sách điểm danh
router.get('/',
  authMiddleware,
  attendanceController.getAttendance
);

// GET /attendance/stats/:studentId/:courseId - Thống kê điểm danh
router.get('/stats/:studentId/:courseId',
  authMiddleware,
  attendanceController.getStudentAttendanceStats
);

// GET /attendance/stats/:studentId - Thống kê điểm danh (tất cả khóa học)
router.get('/stats/:studentId',
  authMiddleware,
  attendanceController.getStudentAttendanceStats
);

// DELETE /attendance/:id - Xóa điểm danh (ADMIN)
router.delete('/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  attendanceController.deleteAttendance
);

module.exports = router;
