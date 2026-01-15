const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /profile - Lấy thông tin profile
router.get('/', authMiddleware, profileController.getProfile);

// PUT /profile - Cập nhật profile
router.put('/', authMiddleware, profileController.updateProfile);

// POST /profile/change-password - Đổi mật khẩu
router.post('/change-password', authMiddleware, profileController.changePassword);

module.exports = router;
