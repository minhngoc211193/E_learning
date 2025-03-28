const express = require('express');
const majorController = require('../controllers/majorController');
const {verifyToken, verifyAdmin} = require('../middlewares/authMiddleware');

const router = express.Router();


router.post("/create-major", verifyToken, majorController.createMajor);
router.get("/majors", verifyToken, majorController.getAllMajors);
router.get("/detail-major/:id", verifyToken, majorController.getMajorById);
router.put("/update-major/:id", verifyToken, majorController.updateMajor);
router.delete("/delete-major/:id", verifyToken, majorController.deleteMajor);
router.get("/search-major", verifyToken, majorController.searchMajor);

module.exports = router;