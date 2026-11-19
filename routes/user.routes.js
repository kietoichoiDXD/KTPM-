const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { createUserValidator, updateUserValidator } = require('../validators/user.validator');
const { validationResult } = require('express-validator');

// Middleware kiểm tra validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Tất cả các routes trong user.routes đều yêu cầu đăng nhập và có quyền ADMIN
router.use(authMiddleware, roleMiddleware(['ADMIN']));

// GET /users - Lấy danh sách users (phân trang, tìm kiếm, lọc theo role ADMIN/USER)
router.get('/', userController.getUsers);

// GET /users/:id - Chi tiết user kèm student info
router.get('/:id', userController.getUserById);

// POST /users - Tạo user mới kèm vai trò, trạng thái, liên kết sinh viên
router.post('/', createUserValidator, validate, userController.createUser);

// PUT /users/:id - Cập nhật role, reset password, link student, username, trạng thái
router.put('/:id', updateUserValidator, validate, userController.updateUser);

// DELETE /users/:id - Xóa user (không cho tự xóa chính mình)
router.delete('/:id', userController.deleteUser);

module.exports = router;
