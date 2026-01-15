const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backup.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// POST /backup - Tạo backup (chỉ ADMIN)
router.post('/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  backupController.backupDatabase
);

// GET /backup - Danh sách backup (chỉ ADMIN)
router.get('/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  backupController.listBackups
);

// GET /backup/:filename - Download backup (chỉ ADMIN)
router.get('/:filename',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  backupController.downloadBackup
);

module.exports = router;
