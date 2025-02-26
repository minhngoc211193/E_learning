const { body, validationResult } = require('express-validator');

const validateRegister = [
    body('Fullname')
        .notEmpty().withMessage('Fullname không được để trống')
        .isLength({ min: 3 }).withMessage('Fullname phải có ít nhất 3 ký tự')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Username chỉ được chứa chữ cái và số, không có ký tự đặc biệt'),
    body('Username')
        .notEmpty().withMessage('Username không được để trống')
        .isLength({ min: 3 }).withMessage('Username phải có ít nhất 3 ký tự')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Username chỉ được chứa chữ cái và số, không có ký tự đặc biệt'),

    body('Email')
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ'),

    body('Password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/[A-Z]/).withMessage('Mật khẩu phải chứa ít nhất một chữ cái viết hoa')
        .matches(/[a-z]/).withMessage('Mật khẩu phải chứa ít nhất một chữ cái viết thường')
        .matches(/[0-9]/).withMessage('Mật khẩu phải chứa ít nhất một chữ số'),

    body('Role')
        .optional()
        .isIn(['admin', 'tutor', 'student']).withMessage('Role không hợp lệ'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

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
