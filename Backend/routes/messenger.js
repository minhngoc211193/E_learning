const express = require('express');
const router = express.Router();
const { 
  searchUser, 
  createConversation, 
  sendMessage, 
  getConversations, 
  getMessages 
} = require('../controllers/messengerController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Route to search for a user (teacher or student depending on current user's role)
router.get('/search', verifyToken, verifyRole(['student', 'teacher']), searchUser);

// Route to create a conversation between a student and teacher
router.post('/create', verifyToken, verifyRole(['student', 'teacher']), createConversation);

// Route to send a message in a conversation
router.post('/send-message', verifyToken, verifyRole(['student', 'teacher']), sendMessage);

// Route to get all conversations for the current user
router.get('/conversations', verifyToken, getConversations);

// Route to get messages for a specific conversation
router.get('/conversations/:conversationId/messages', verifyToken, verifyRole(['student', 'teacher']), getMessages);

module.exports = router;