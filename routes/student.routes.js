const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const { createStudentValidator, updateStudentValidator } = require('../validators/student.validator');
const { validationResult } = require('express-validator');

// Middleware kiểm tra validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /students - Lấy danh sách (USER có thể xem)
router.get('/', authMiddleware, studentController.getStudents);

// GET /students/:id - Lấy chi tiết (USER có thể xem)
router.get('/:id', authMiddleware, studentController.getStudentById);

// POST /students - Tạo mới (chỉ ADMIN)
router.post('/', 
  authMiddleware, 
  roleMiddleware(['ADMIN']), 
  upload.single('avatar'),
  createStudentValidator,
  validate,
  studentController.createStudent
);

// PUT /students/:id - Cập nhật (chỉ ADMIN)
router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['ADMIN']),
  upload.single('avatar'),
  updateStudentValidator,
  validate,
  studentController.updateStudent
);

// DELETE /students/:id - Xóa (chỉ ADMIN)
router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['ADMIN']),
  studentController.deleteStudent
);

module.exports = router;
