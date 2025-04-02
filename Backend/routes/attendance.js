const express = require('express');
const {attendanceController} = require('../controllers/attendanceController');
const { verifyAdmin, verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/get-attendance-by-schedule/:scheduleId', verifyToken, verifyRole(['teacher', 'admin']), attendanceController.getAttendanceBySchedule);
router.put('/update-attendance', verifyToken, verifyRole(['teacher', 'admin']), attendanceController.updateAttendance);

module.exports = router;
