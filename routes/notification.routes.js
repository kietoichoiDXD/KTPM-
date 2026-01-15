const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /notifications - Lấy thông báo của user
router.get('/',
  authMiddleware,
  notificationController.getNotifications
);

// POST /notifications - Tạo thông báo (ADMIN)
router.post('/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  notificationController.createNotification
);

// PUT /notifications/:id/read - Đánh dấu đã đọc
router.put('/:id/read',
  authMiddleware,
  notificationController.markAsRead
);

// PUT /notifications/read-all - Đánh dấu tất cả đã đọc
router.put('/read-all',
  authMiddleware,
  notificationController.markAllAsRead
);

// DELETE /notifications/:id - Xóa thông báo
router.delete('/:id',
  authMiddleware,
  notificationController.deleteNotification
);

module.exports = router;
