const express = require('express');
const router = express.Router();
const messengerController = require('../controllers/messengerController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// API để gửi tin nhắn mới
router.post('/send', verifyToken, verifyRole(["student", "teacher"]), async (req, res) => {
  messengerController.sendMessage(req, res);
});

// API để cập nhật trạng thái tin nhắn
router.put('/updateStatus', verifyToken, verifyRole(["student", "teacher"]), async (req, res) => {
  messengerController.updateMessageStatus(req, res);
});

// API để tìm kiếm người dùng và tạo conversation
router.post('/search', verifyToken, verifyRole(["student", "teacher"]), async (req, res) => {
  messengerController.searchUserAndCreateConversation(req, res);
});

// API để lấy tin nhắn của một conversation (với phân trang)
router.get('/history', verifyToken, verifyRole(["student", "teacher"]), async (req, res) => {
  messengerController.getMessageHistory(req, res);
});

// API để lấy tất cả cuộc trò chuyện của người dùng
router.get('/conversations', verifyToken, verifyRole(["student", "teacher"]), async (req, res) => {
  messengerController.getAllConversations(req, res);
});

// API để thông báo trạng thái "typing"
router.post('/typing', verifyToken, verifyRole(["student", "teacher"]), async (req, res) => {
  messengerController.typingStatus(req, res);
});

module.exports = router;
