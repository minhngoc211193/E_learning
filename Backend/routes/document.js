const documentController = require('../controllers/documentController');

const {verifyAdmin, verifyToken, verifyRole} = require('../middlewares/authMiddleware')

const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/upload-document', upload.single('file'),verifyToken, documentController.createDocument);
router.get('/documents/class/:classId', verifyToken, documentController.getDocumentsByClass);
router.get('/download-document/:documentId', verifyToken, documentController.downloadDocument);
router.put('/update-document/:documentId', verifyToken, documentController.updateDocument);
router.delete('/delete-document/:documentId', verifyToken, documentController.deleteDocument);
router.get("/search-document", documentController.searchDocument);


module.exports = router;