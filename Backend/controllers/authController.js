const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Hàm tạo mật khẩu ngẫu nhiên
const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8); // Tạo mật khẩu 8 ký tự
};

// Cấu hình gửi email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Email gửi đi
        pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng
    }
});

const authController = {
    registerUser: async (req, res) => {
        try {
            const { Fullname, Username, DateOfBirth, Gender, Role, Major, Email, PhoneNumber, SchoolYear } = req.body;

            const existingUser = await User.findOne({ $or: [{ Username }, { Email }] });
            if (existingUser) {
                return res.status(400).json({ message: "Username or email already exists" });
            }

            if ((Role === 'student' || Role === 'teacher') && !Major) {
                return res.status(400).json({ message: "Major is required for student or teacher roles" });
            }

            // ✅ 1. Tạo mật khẩu ngẫu nhiên
            const randomPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // ✅ 2. Lưu user vào database
            const newUser = new User({
                Fullname,
                Username,
                Password: hashedPassword,
                DateOfBirth,
                Gender,
                Role: Role || "student",
                Major: (Role === 'student' || Role === 'teacher') ? Major : null,
                Email,
                SchoolYear: (Role === 'student') ? SchoolYear : null,
                PhoneNumber,
                firstLogin: true // Đánh dấu chưa đổi mật khẩu
            });

            await newUser.save();

            // ✅ 3. Gửi email thông tin đăng nhập cho user
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: Email,
                subject: "Tài khoản mới của bạn tại Greenwich 🎓",
                text: `📢 Xin chào ${Fullname},
            
            Chúng tôi là admin của Greenwich.
            
            🎉 Chúc mừng! Tài khoản của bạn đã được tạo thành công.
            
            🔹 Thông tin đăng nhập:
            📧 Email: ${Email}
            🔑 Mật khẩu: ${randomPassword}
            
            ⚠️ Lưu ý: Vui lòng đăng nhập ngay và thay đổi mật khẩu để bảo mật tài khoản.
            
            💡 Nếu có bất kỳ vấn đề gì, hãy liên hệ với đội ngũ hỗ trợ thông qua số điện thoại: 0969925773.
            
            Trân trọng,
            🚀 Đội ngũ quản trị hệ thống Greenwich`
            };            

            await transporter.sendMail(mailOptions);

            res.status(201).json({ message: "User created and email sent successfully" });
        } catch (err) {
            console.error("❌ Register Error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ Email: req.body.Email });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }

            const validPassword = await bcrypt.compare(req.body.Password, user.Password);
            if (!validPassword) {
                return res.status(400).json({ message: "Incorrect password" });
            }

            // ✅ Kiểm tra nếu là lần đăng nhập đầu tiên
            if (user.firstLogin) {
                return res.status(403).json({ message: "Bạn cần đổi mật khẩu trước khi tiếp tục", firstLogin: true });
            }

            const accessToken = jwt.sign(
                { id: user._id, Role: user.Role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            const { Password, ...others } = user.toObject();
            res.cookie("token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            }).status(200).json({...others, accessToken});
            
        } catch (err) {
            console.error("❌ Login Error:", err);
            res.status(500).json({ message: "Login failed", error: err.message });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { userId, oldPassword, newPassword } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }

            const validPassword = await bcrypt.compare(oldPassword, user.Password);
            if (!validPassword) {
                return res.status(400).json({ message: "Incorrect old password" });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.Password = hashedNewPassword;
            user.firstLogin = false; // ✅ Đánh dấu đã đổi mật khẩu

            await user.save();
            res.status(200).json({ message: "Password changed successfully" });
        } catch (err) {
            console.error("❌ Change Password Error:", err);
            res.status(500).json({ message: "Error changing password", error: err.message });
        }
    }
};

module.exports = authController;
