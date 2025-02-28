const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validateMiddleware');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register',verifyAdmin, validateRegister, authController.registerUser);
router.post('/login', validateLogin, authController.loginUser);
router.post('/change-password', authController.changePassword);

module.exports = router;