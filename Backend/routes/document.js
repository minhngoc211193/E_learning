const documentController = require('../controllers/documentController');

const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload-document', upload.single('file'), documentController.createDocument);

module.exports = router;