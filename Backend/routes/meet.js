const express = require('express');
const meetController = require('../controllers/meetController');
const router = express.Router();
const { verifyToken, verifyAdmin, verifyRole } = require('../middlewares/authMiddleware');  

router.post('/request-meeting', verifyToken, verifyRole(['student']), meetController.requestMeeting);

router.post('/handle-meeting-request', verifyToken, verifyRole(['teacher']), meetController.handleMeetingRequest);

router.get('/admin/meeting-requests', verifyToken, verifyAdmin, meetController.getAllMeetingRequests);

router.get('/student/meetings', verifyToken, verifyRole(['student']), meetController.getStudentMeetings);

router.get('/teacher/meetings', verifyToken, verifyRole(['teacher']), meetController.getTeacherMeetings);

module.exports = router;
