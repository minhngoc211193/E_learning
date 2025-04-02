const express = require('express');
const majorController = require('../controllers/majorController');
const {verifyToken, verifyAdmin} = require('../middlewares/authMiddleware');

const router = express.Router();


router.post("/create-major", verifyAdmin, majorController.createMajor);
router.get("/majors", verifyAdmin, majorController.getAllMajors);
router.get("/detail-major/:id", verifyAdmin, majorController.getMajorById);
router.put("/update-major/:id", verifyAdmin, majorController.updateMajor);
router.delete("/delete-major/:id", verifyAdmin, majorController.deleteMajor);
router.get("/search-major", verifyAdmin, majorController.searchMajor);

module.exports = router;