const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validateMiddleware');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', validateRegister, authController.registerUser);
router.post('/login', validateLogin, authController.loginUser);

module.exports = router;