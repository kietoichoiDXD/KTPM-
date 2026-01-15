const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /grades - Lấy danh sách điểm
router.get('/', authMiddleware, gradeController.getGrades);

// POST /grades - Tạo/cập nhật điểm (ADMIN)
router.post('/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  gradeController.upsertGrade
);

// GET /grades/transcript/:studentId - Xem bảng điểm sinh viên
router.get('/transcript/:studentId',
  authMiddleware,
  gradeController.getStudentTranscript
);

// DELETE /grades/:id - Xóa điểm (ADMIN)
router.delete('/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  gradeController.deleteGrade
);

module.exports = router;
