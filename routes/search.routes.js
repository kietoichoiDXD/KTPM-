const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /search?q=keyword - Tìm kiếm toàn cục
router.get('/', authMiddleware, searchController.globalSearch);

// GET /search/students/advanced - Tìm kiếm nâng cao sinh viên
router.get('/students/advanced', authMiddleware, searchController.advancedStudentSearch);

module.exports = router;
