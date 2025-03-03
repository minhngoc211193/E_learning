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

const otpStorage = {};

const authController = {
    registerUser: async (req, res) => {
        try {
            const { Fullname, Username, DateOfBirth, Gender, Role, Major, Email, PhoneNumber } = req.body;

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
                PhoneNumber,
                firstLogin: true // Đánh dấu chưa đổi mật khẩu
            });


            // ✅ Fix lỗi: Gán SchoolYear mặc định nếu Role là "student"
            if (newUser.Role === "student") {
                newUser.SchoolYear = 1;  
            }

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
            }).status(200).json({user: others, accessToken});
            
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
    },

    resetPasswordWithOldPassword: async (req, res) => {
        try {
            const { userId, oldPassword, newPassword } = req.body;
    
            // 1. Kiểm tra user có tồn tại không
            const user = await User.findById(userId);
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
    
            // 2. Kiểm tra mật khẩu cũ có đúng không
            const validPassword = await bcrypt.compare(oldPassword, user.Password);
            if (!validPassword) {
                return res.status(400).json({ message: "Incorrect old password" });
            }
    
            // 3. Kiểm tra độ mạnh của mật khẩu mới
            const isStrongPassword = (password) => {
                return password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password);
            };
    
            if (!isStrongPassword(newPassword)) {
                return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm số và chữ hoa" });
            }
    
            // 4. Hash mật khẩu mới và lưu vào database
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.Password = hashedNewPassword;
            await user.save();
    
            res.status(200).json({ message: "Password updated successfully" });
        } catch (err) {
            console.error("❌ Reset Password Error:", err);
            res.status(500).json({ message: "Error resetting password" });
        }
    },

    sendResetPasswordOTP: async (req, res) => {
        try {
            const { Email } = req.body;
    
            // 1. Kiểm tra user có tồn tại không
            const user = await User.findOne({ Email });
            if (!user) {
                return res.status(400).json({ message: "Email không tồn tại" });
            }
    
            // 2. Tạo mã OTP (6 số ngẫu nhiên)
            const otpCode = Math.floor(100000 + Math.random() * 900000);
            otpStorage[Email] = { otp: otpCode, expiresAt: Date.now() + 5 * 60 * 1000 }; // OTP có hiệu lực 5 phút
    
            // 3. Gửi email OTP
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: Email,
                subject: "🔐 Yêu cầu đặt lại mật khẩu",
                text: `Mã OTP của bạn là: ${otpCode}. Mã này có hiệu lực trong 5 phút.`
            };
    
            await transporter.sendMail(mailOptions);
    
            res.status(200).json({ message: "OTP đã được gửi đến email của bạn" });
        } catch (err) {
            console.error("❌ Send OTP Error:", err);
            res.status(500).json({ message: "Error sending OTP" });
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const { Email, otp } = req.body;
    
            // 1. Kiểm tra OTP có hợp lệ không
            if (!otpStorage[Email] || otpStorage[Email].expiresAt < Date.now()) {
                return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
            }
    
            if (otpStorage[Email].otp !== parseInt(otp)) {
                return res.status(400).json({ message: "OTP không đúng" });
            }
    
            // Xóa OTP khỏi bộ nhớ tạm
            delete otpStorage[Email];
    
            res.status(200).json({ message: "OTP hợp lệ, bạn có thể đặt lại mật khẩu" });
        } catch (err) {
            console.error("❌ Verify OTP Error:", err);
            res.status(500).json({ message: "Error verifying OTP" });
        }
    },
    
    resetPasswordWithOTP: async (req, res) => {
        try {
            const { Email, newPassword } = req.body;
    
            // 1. Kiểm tra user có tồn tại không
            const user = await User.findOne({ Email });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
    
            // 2. Kiểm tra độ mạnh của mật khẩu mới
            const isStrongPassword = (password) => {
                return password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password);
            };
    
            if (!isStrongPassword(newPassword)) {
                return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm số và chữ hoa" });
            }
    
            // 3. Hash mật khẩu mới và lưu vào database
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.Password = hashedNewPassword;
            await user.save();
    
            res.status(200).json({ message: "Mật khẩu đã được cập nhật thành công" });
        } catch (err) {
            console.error("❌ Reset Password Error:", err);
            res.status(500).json({ message: "Error resetting password" });
        }
    }
};

module.exports = authController;
