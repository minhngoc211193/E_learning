const express = require('express');
const subjectController = require('../controllers/subjectController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create-subject', verifyAdmin, subjectController.createSubject);           // Tạo Subject mới
router.get('/subjects', verifyAdmin, subjectController.getSubject);          // Lấy tất cả Subject
router.get('/detail-subject/:id', verifyAdmin, subjectController.detailSubject);       // Lấy Subject theo ID
router.put('/update-subject/:id', verifyAdmin, subjectController.updateSubject);       // Cập nhật Subject theo ID
router.delete('/delete-subject/:id', verifyAdmin, subjectController.deleteSubject);     // Xóa Subject theo ID
router.get('/get-subjects-by-major/:majorId', verifyToken,  subjectController.getSubjectsByMajor); // Lấy tất cả Subject theo Major


module.exports = router;