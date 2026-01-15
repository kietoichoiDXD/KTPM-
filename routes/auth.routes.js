const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

// POST /auth/register - Đăng ký
router.post('/register', registerValidator, authController.register);

// POST /auth/login - Đăng nhập
router.post('/login', loginValidator, authController.login);

module.exports = router;
