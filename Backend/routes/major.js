const express = require('express');
const majorController = require('../controllers/majorController');

const router = express.Router();


router.post("/create-major", majorController.createMajor);
router.get("/majors", majorController.getAllMajors);
router.get("/detail-major/:id", majorController.getMajorById);
router.put("/update-major/:id", majorController.updateMajor);
router.delete("/delete-major/:id", majorController.deleteMajor);

module.exports = router;