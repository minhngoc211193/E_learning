var express = require('express');
const userController = require('../controllers/userController');
const {verifyAdmin, verifyToken} = require('../middlewares/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

var router = express.Router();
/* GET users listing. */
router.get('/users', verifyAdmin, userController.getUser);
router.put('/update-user/:id', upload.single('file'), verifyAdmin, userController.updateUser);
router.delete('/delete-user/:id', verifyAdmin, userController.deleteUser);
router.get('/detail-user/:id', verifyToken, userController.detailUser);
router.get('/users-by-major/:id', verifyAdmin, userController.getUserByMajor);
router.get('/search-user', verifyAdmin, userController.searchUser);
router.get('/users-by-subject', verifyAdmin, userController.getUsersBySubject);

module.exports = router;