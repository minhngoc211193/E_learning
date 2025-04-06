const express = require('express');
const router = express.Router();
const { 
    getStudentCountByMajor, 
    getTeacherCountByMajor, 
    getClassCountBySubject, 
    getSubjectCountByMajor 
} = require('../controllers/dashboardController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Chỉ admin mới được phép truy cập các route này
router.get('/students-by-major', verifyToken, verifyRole(['admin']), getStudentCountByMajor);
router.get('/teachers-by-major', verifyToken, verifyRole(['admin']), getTeacherCountByMajor);
router.get("/classes-by-subject", verifyToken, verifyRole(["admin"]), getClassCountBySubject);
router.get("/subjects-by-major", verifyToken, verifyRole(["admin"]), getSubjectCountByMajor);

module.exports = router;
