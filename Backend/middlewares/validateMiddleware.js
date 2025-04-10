const { body, validationResult } = require('express-validator');
const User = require('../models/User'); // Đảm bảo đã import mô hình User để kiểm tra trùng Username và Email
const moment = require('moment');

// Validate đăng ký người dùng
const validateRegister = [
    body('Fullname')
        .notEmpty().withMessage('Fullname cannot be empty')
        .isLength({ min: 3, max: 20 }).withMessage('Fullname must be at least 3 characters and maximum 20 characters')
        .matches(/^[a-zA-Z\u00C0-\u00FF\s]+$/).withMessage('Fullname chỉ được chứa chữ cái và khoảng trắng, không có ký tự đặc biệt')
        .not().matches(/\d/).withMessage('Fullname cannot contain numbers'),

    body('DateOfBirth')
        .notEmpty().withMessage('Date of birth cannot be left blank')
        .custom((value) => {
            const dob = moment(value, 'YYYY-MM-DD'); // Chuyển đổi giá trị DateOfBirth sang dạng moment
            const today = moment.utc(); // Lấy ngày hiện tại theo múi giờ UTC của MongoDB
            const age = today.diff(dob, 'years'); // Tính tuổi

            // Kiểm tra ngày sinh không được trong tương lai
            if (dob.isAfter(today)) {
                throw new Error('Date of birth cannot be in the future');
            }

            // Kiểm tra tuổi trong khoảng 18 đến 50
            if (age < 18) {
                throw new Error('Age must be 18 or older');
            }
            if (age > 50) {
                throw new Error('Age not over 50');
            }

            return true; // Nếu không có lỗi, trả về true
        }),

    body('Email')
        .notEmpty().withMessage('Email cannot be blank')
        .isEmail().withMessage('Invalid email')
        .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/).withMessage('Email must end with "@gmail.com"')
        .custom(async (value) => {
            const existingUser = await User.findOne({ Email: value });
            if (existingUser) {
                throw new Error('Email already exists');
            }
        }),

    body('Role')
        .notEmpty().withMessage('Role cannot be left blank')
        .isIn(['admin', 'teacher', 'student']).withMessage('Role must be admin, teacher or student'),

    body('PhoneNumber')
        .notEmpty().withMessage('Phone number cannot be blank')
        .isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 characters long')
        .matches(/^0\d{9}$/).withMessage('Phone number must start with "0" and contain only numbers'),

    body('Gender')
        .notEmpty().withMessage('Gender cannot be left blank')
        .isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validate đăng nhập
const validateLogin = [
    body('Email')
        .notEmpty().withMessage('Email cannot be blank')
        .isEmail().withMessage('Invalid email'),

    body('Password')
        .notEmpty().withMessage('Password cannot be blank'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateRegister, validateLogin };
