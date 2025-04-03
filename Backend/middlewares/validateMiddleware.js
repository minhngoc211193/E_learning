const { body, validationResult } = require('express-validator');
const User = require('../models/User'); // Đảm bảo đã import mô hình User để kiểm tra trùng Username và Email
const moment = require('moment');

// Validate đăng ký người dùng
const validateRegister = [
    body('Fullname')
        .notEmpty().withMessage('Fullname không được để trống')
        .isLength({ min: 3, max: 20 }).withMessage('Fullname phải có ít nhất 3 ký tự và tối đa 20 ký tự')
        .matches(/^[a-zA-Z\u00C0-\u00FF\s]+$/).withMessage('Fullname chỉ được chứa chữ cái và khoảng trắng, không có ký tự đặc biệt')
        .not().matches(/\d/).withMessage('Fullname không được chứa số'),

    body('DateOfBirth')
        .notEmpty().withMessage('Ngày sinh không được để trống')
        .custom((value) => {
            const dob = moment(value, 'YYYY-MM-DD'); // Chuyển đổi giá trị DateOfBirth sang dạng moment
            const today = moment.utc(); // Lấy ngày hiện tại theo múi giờ UTC của MongoDB
            const age = today.diff(dob, 'years'); // Tính tuổi

            // Kiểm tra ngày sinh không được trong tương lai
            if (dob.isAfter(today)) {
                throw new Error('Ngày sinh không được trong tương lai');
            }

            // Kiểm tra tuổi trong khoảng 18 đến 50
            if (age < 18) {
                throw new Error('Tuổi phải từ 18 trở lên');
            }
            if (age > 50) {
                throw new Error('Tuổi không được quá 50');
            }

            return true; // Nếu không có lỗi, trả về true
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

    body('Role')
        .notEmpty().withMessage('Role không được để trống')
        .isIn(['admin', 'teacher', 'student']).withMessage('Role phải là admin, teacher hoặc student'),

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
