const express = require('express');
const router = express.Router();
const { 
    getStudentCountByMajor, 
    getTeacherCountByMajor, 
    getClassCountBySubject, 
    getSubjectCountByMajor,
    getBlogCountByDay,
    getStudentClassStatus,
    getMessageCountByDay
} = require('../controllers/dashboardController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.get('/students-by-major', verifyToken, verifyRole(['admin']), getStudentCountByMajor);
router.get('/teachers-by-major', verifyToken, verifyRole(['admin']), getTeacherCountByMajor);
router.get("/classes-by-subject", verifyToken, verifyRole(["admin"]), getClassCountBySubject);
router.get("/subjects-by-major", verifyToken, verifyRole(["admin"]), getSubjectCountByMajor);
router.get("/blog-by-day", verifyToken, verifyRole(['admin']), getBlogCountByDay);
router.get("/students-class-status", verifyToken, verifyRole(['admin']), getStudentClassStatus);
router.get("/messages-by-day", verifyToken, verifyRole(['admin']), getMessageCountByDay);
module.exports = router;
