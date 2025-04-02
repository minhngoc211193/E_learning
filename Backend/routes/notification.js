const express = require('express');
const router = express.Router();
const { 
    getAllNotifications, 
    markNotificationAsRead 
} = require('../controllers/notificationController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Route to get all notifications for the authenticated user
router.get('/noti', verifyToken , verifyRole(['student', 'teacher']), getAllNotifications);

// // Route to mark a specific notification as read
router.patch('/:notificationId/read',verifyToken , verifyRole(['student', 'teacher']), markNotificationAsRead);

module.exports = router;