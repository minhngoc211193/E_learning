const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin, verifyRole } = require('../middlewares/authMiddleware');  
const { requestMeeting, getMeetings, respondToMeetingRequest, searchMeetings, deleteMeetingRequest, updateMeetingRequest  } = require('../controllers/meetController');  


router.post('/request-meeting', verifyToken, verifyRole(['student']), requestMeeting);

router.get('/meetings', verifyToken, verifyRole(['student', 'teacher', 'admin']), getMeetings);

router.post('/respond-meeting', verifyToken, verifyRole(['teacher']), respondToMeetingRequest);

router.get('/search', verifyToken, verifyRole(['student', 'teacher', 'admin']), searchMeetings);

router.delete('/delete', verifyToken, verifyRole(['student']), deleteMeetingRequest);

router.put('/update/:meetingId', verifyToken, verifyRole(['student']), updateMeetingRequest);

module.exports = router;