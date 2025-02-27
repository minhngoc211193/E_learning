const { body, validationResult } = require('express-validator');
const User = require('../models/User'); // Đảm bảo đã import mô hình User để kiểm tra trùng Username và Email

// Validate đăng ký người dùng
const validateRegister = [
    body('Fullname')
        .notEmpty().withMessage('Fullname không được để trống')
        .isLength({ min: 3, max: 20 }).withMessage('Fullname phải có ít nhất 3 ký tự và tối đa 20 ký tự')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Fullname chỉ được chứa chữ cái và khoảng trắng, không có ký tự đặc biệt')
        .not().matches(/\d/).withMessage('Fullname không được chứa số'),

    body('Username')
        .notEmpty().withMessage('Username không được để trống')
        .isLength({ min: 3, max: 20 }).withMessage('Username phải có ít nhất 3 ký tự và tối đa 20 ký tự')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Username chỉ được chứa chữ cái và số, không có ký tự đặc biệt')
        .matches(/^\S*$/).withMessage('Username không được chứa khoảng trắng')
        .custom(async (value) => {
            const existingUser = await User.findOne({ Username: value });
            if (existingUser) {
                throw new Error('Username đã tồn tại');
            }
        }),

    body('Email')
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/).withMessage('Email phải kết thúc bằng "@gmail.com"')
        .custom(async (value) => {
            const existingUser = await User.findOne({ Email: value });
            if (existingUser) {
                throw new Error('Email đã tồn tại');
            }
        }),

    body('Password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Mật khẩu không được chứa ký tự đặc biệt')
        .not().matches(/\s/).withMessage('Mật khẩu không được chứa khoảng trắng'),

    body('Role')
        .notEmpty().withMessage('Role không được để trống')
        .isIn(['admin', 'tutor', 'student']).withMessage('Role phải là admin, tutor hoặc student'),

    body('PhoneNumber')
        .notEmpty().withMessage('Số điện thoại không được để trống')
        .isLength({ min: 10, max: 10 }).withMessage('Số điện thoại phải có độ dài 10 ký tự')
        .matches(/^0\d{9}$/).withMessage('Số điện thoại phải bắt đầu bằng "0" và chỉ chứa số'),

    body('Gender')
        .notEmpty().withMessage('Giới tính không được để trống')
        .isIn(['Male', 'Female']).withMessage('Giới tính phải là Male hoặc Female'),

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
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ'),

    body('Password')
        .notEmpty().withMessage('Mật khẩu không được để trống'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateRegister, validateLogin };
