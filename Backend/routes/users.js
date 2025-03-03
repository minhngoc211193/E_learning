var express = require('express');
const userController = require('../controllers/userController');
const {verifyAdmin, verifyToken} = require('../middlewares/authMiddleware');

var router = express.Router();
/* GET users listing. */
router.get('/users', verifyAdmin, userController.getUser);
router.put('/update-user/:id', verifyAdmin, userController.updateUser);
router.delete('/delete-user/:id', verifyAdmin, userController.deleteUser);
router.get('/detail-user/:id', verifyToken, userController.detailUser);

module.exports = router;