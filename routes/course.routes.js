const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { createCourseValidator, updateCourseValidator } = require('../validators/course.validator');
const { validationResult } = require('express-validator');

// Middleware kiểm tra validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /courses - Lấy danh sách (USER có thể xem)
router.get('/', authMiddleware, courseController.getCourses);

// GET /courses/:id - Lấy chi tiết (USER có thể xem)
router.get('/:id', authMiddleware, courseController.getCourseById);

// POST /courses - Tạo mới (chỉ ADMIN)
router.post('/', 
  authMiddleware, 
  roleMiddleware(['ADMIN']),
  createCourseValidator,
  validate,
  courseController.createCourse
);

// PUT /courses/:id - Cập nhật (chỉ ADMIN)
router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['ADMIN']),
  updateCourseValidator,
  validate,
  courseController.updateCourse
);

// DELETE /courses/:id - Xóa (chỉ ADMIN)
router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['ADMIN']),
  courseController.deleteCourse
);

// POST /courses/:id/students - Thêm sinh viên vào khóa học (ADMIN)
router.post('/:id/students',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  courseController.addStudentToCourse
);

// DELETE /courses/:id/students/:studentId - Xóa sinh viên khỏi khóa học (ADMIN)
router.delete('/:id/students/:studentId',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  courseController.removeStudentFromCourse
);

module.exports = router;
