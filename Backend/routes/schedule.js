const express = require('express');
const scheduleController = require('../controllers/scheduleController');
const {verifyToken, verifyAdmin} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create-schedule', verifyAdmin, scheduleController.createSchedule);  
router.put('/update-schedule/:id', verifyAdmin, scheduleController.updateSchedule);
router.delete('/delete-schedule/:id', verifyAdmin, scheduleController.deleteSchedule);
router.get('/get-schedule-by-user', verifyToken, scheduleController.getScheduleByUserId);
router.get('/get-schedule-by-day', verifyAdmin, scheduleController.getScheduleByDay);
router.get('/detail-schedule/:id', verifyAdmin, scheduleController.getScheduleById);

module.exports = router;