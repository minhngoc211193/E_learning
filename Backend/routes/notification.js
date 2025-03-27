const express = require('express');
const router = express.Router();
const { 
  getUnreadNotifications, 
  markNotificationAsRead 
} = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET: Lấy danh sách thông báo chưa đọc của người dùng
router.get('/unread', getUnreadNotifications);

// PUT: Đánh dấu một thông báo cụ thể là đã đọc
router.put('/:notificationId/read', markNotificationAsRead);

module.exports = router;