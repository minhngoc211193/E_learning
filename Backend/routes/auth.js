const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validateMiddleware');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register',verifyAdmin, validateRegister, authController.registerUser);
router.post('/login', validateLogin, authController.loginUser);
router.post('/change-password', authController.changePassword);
router.post('/reset-password', verifyToken, authController.resetPasswordWithOldPassword);
router.post('/forgot-password', authController.sendResetPasswordOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password-otp', authController.resetPasswordWithOTP);


module.exports = router;