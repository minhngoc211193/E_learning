const express = require('express');
const router = express.Router();
const {searchAndCreateConversation, sendMessage, getConversations, getMessages, markMessageAsDelivered, markMessageAsRead } = require('../controllers/messengerController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.post('/search-and-create-conversation', verifyToken, verifyRole(['student', 'teacher']), searchAndCreateConversation);

// Route gửi tin nhắn mới (Chỉ dành cho student hoặc teacher)
router.post('/send-message', verifyToken, verifyRole(['student', 'teacher']), sendMessage);

// Route lấy tất cả cuộc trò chuyện (Dành cho tất cả user đã đăng nhập)
router.get('/conversations', verifyToken, getConversations);

// Route lấy tin nhắn trong một cuộc trò chuyện (Chỉ dành cho student hoặc teacher)
router.get('/conversations/:conversationId/messages', verifyToken, verifyRole(['student', 'teacher']), getMessages);

// Route đánh dấu tin nhắn là "đã giao" (delivered) (Chỉ dành cho student hoặc teacher)
router.post('/mark-delivered/:conversationId/:messageId', verifyToken, verifyRole(['student', 'teacher']), (req, res) => {
  const { conversationId, messageId } = req.params;
  markMessageAsDelivered(conversationId, messageId)
    .then(() => res.status(200).json({ message: 'Message marked as delivered' }))
    .catch((err) => res.status(500).json({ message: 'Error', error: err }));
});

// Route đánh dấu tin nhắn là "đã đọc" (read) (Chỉ dành cho student hoặc teacher)
router.post('/mark-read/:messageId', verifyToken, verifyRole(['student', 'teacher']), (req, res) => {
  const { messageId } = req.params;
  markMessageAsRead(messageId)
    .then(() => res.status(200).json({ message: 'Message marked as read' }))
    .catch((err) => res.status(500).json({ message: 'Error', error: err }));
});


module.exports = router;
