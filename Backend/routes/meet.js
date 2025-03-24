const express = require('express');
const router = express.Router();
const { requestMeeting, handleMeetingRequest, getAllMeetingRequests, getTeacherMeetings, getStudentMeetings } = require('../controllers/meetController');  
const { verifyToken, verifyAdmin, verifyRole } = require('../middlewares/authMiddleware');  

router.post('/request-meeting', verifyToken, verifyRole(['student']), requestMeeting);

router.post('/handle-meeting-request', verifyToken, verifyRole(['teacher']), handleMeetingRequest);

router.get('/admin/meeting-requests', verifyToken, verifyAdmin, getAllMeetingRequests);

router.get('/student/meetings', verifyToken, verifyRole(['student']), getStudentMeetings);

router.get('/teacher/meetings', verifyToken, verifyRole(['teacher']), getTeacherMeetings);

module.exports = router;
