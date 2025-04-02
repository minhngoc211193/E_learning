const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const {verifyToken, verifyAdmin, verifyRole} = require('../middlewares/authMiddleware');

// Các route cho Class API
router.get('/classes', verifyAdmin, classController.getClasses);             // Lấy tất cả lớp học
router.post('/create-class', verifyAdmin,  classController.createClass);              // Tạo lớp học mới
router.get('/detail-class/:id', verifyToken, classController.getClassById);           // Lấy lớp học theo ID
router.put('/update-class/:id', verifyAdmin, classController.updateClass);            // Cập nhật lớp học theo ID
router.delete('/delete-class/:id', verifyAdmin, classController.deleteClass);         // Xóa lớp học theo ID
router.get('/classes-by-subject/:subjectId', verifyAdmin, classController.getClassesBySubject);  // Lấy tất cả lớp học theo Subject
router.get('/class-by-userId/:userId',verifyToken, verifyRole(["teacher","student"]), classController.getClassByUser);
router.get("/search-class", verifyToken, classController.searchClass);

module.exports = router;