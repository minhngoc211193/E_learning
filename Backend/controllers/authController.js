const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const Major = require('../models/Major');

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
            const { Fullname, DateOfBirth, Gender, Role, MajorId, Email, PhoneNumber, SchoolYear } = req.body;

            const existingUser = await User.findOne({ Email });
            if (existingUser) {
                return res.status(400).json({ message: "Username or email already exists" });
            }

            if ((Role === 'student' || Role === 'teacher') && !MajorId) {
                return res.status(400).json({ message: "Major is required for student or teacher roles" });
            }

            // ✅ 1. Tạo mật khẩu ngẫu nhiên
            const randomPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            let Username = "";

            if (Role === 'student') {
                const major = await Major.findById(MajorId);
                const usersInMajor = await User.find({ Major: MajorId, Role: 'student' }).sort({ Username: -1 });

                if (usersInMajor.length > 0) {
                    // Tạo username dựa trên Major (ví dụ "IT1", "IT2")
                    const lastUser = usersInMajor[0];  // Lấy user có Username lớn nhất
                    const majorPrefix = major.Name
                        .split(" ")                  // Tách tên Major thành mảng các từ
                        .map(word => word[0].toUpperCase())  // Lấy chữ cái đầu của mỗi từ và viết hoa
                        .join(""); // Ví dụ "IT" cho Information Technology
                    const lastNumber = parseInt(lastUser.Username.slice(majorPrefix.length)); // Lấy số cuối trong Username hiện tại
                    // Nếu số cuối cùng không hợp lệ hoặc đã đạt đến 9999, bắt đầu lại từ 0001
                    if (isNaN(lastNumber) || lastNumber >= 9999) {
                        Username = `${majorPrefix}0001`; // Nếu đã đạt đến 9999 thì quay lại từ 0001
                    } else {
                        const nextNumber = lastNumber + 1;
                        // Bổ sung số 0 ở phía trước để đảm bảo có 4 chữ số
                        Username = `${majorPrefix}${nextNumber.toString().padStart(4, '0')}`;
                    }
                } else {
                    // Nếu không có user nào, tạo username đầu tiên
                    const majorPrefix = major.Name
                        .split(" ")                  // Tách tên Major thành mảng các từ
                        .map(word => word[0].toUpperCase())  // Lấy chữ cái đầu của mỗi từ và viết hoa
                        .join("");                   // Ghép lại thành một chuỗi

                    Username = `${majorPrefix}0001`; // Username đầu tiên bắt đầu từ 0001
                }
            } else if (Role === 'teacher') {
                // Tạo username cho giảng viên (teacher)
                const usersInTeacherRole = await User.find({ Role: 'teacher' }).sort({ Username: -1 });

                if (usersInTeacherRole.length > 0) {
                    const lastTeacher = usersInTeacherRole[0];
                    const lastNumber = parseInt(lastTeacher.Username.slice(1));  // Lấy số sau "T"

                    if (isNaN(lastNumber) || lastNumber >= 9999) {
                        Username = `T0001`;
                    } else {
                        const nextNumber = lastNumber + 1;
                        Username = `T${nextNumber.toString().padStart(4, '0')}`;
                    }
                } else {
                    Username = `T0001`;  // Username đầu tiên cho giảng viên
                }
            } else if (Role === 'admin') {
                const usersInAdminRole = await User.find({ Role: 'admin' }).sort({ Username: -1 });

                if (usersInAdminRole.length > 0) {
                    const lastAdmin = usersInAdminRole[0];
                    const lastNumber = parseInt(lastAdmin.Username.slice(5));  // Lấy số sau "admin"

                    if (isNaN(lastNumber) || lastNumber >= 9999) {
                        Username = `admin0001`;
                    } else {
                        const nextNumber = lastNumber + 1;
                        Username = `admin${nextNumber.toString().padStart(4, '0')}`;
                    }
                } else {
                    Username = `admin0001`;  // Username đầu tiên cho quản trị viên
                }
            }

            // ✅ 2. Lưu user vào database
            const newUser = new User({
                Fullname,
                Username,
                Password: hashedPassword,
                DateOfBirth,
                Gender,
                Role: Role || "student",
                Major: (Role === 'student' || Role === 'teacher') ? MajorId : null,
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

            // Tạo accessToken cho người dùng
            const accessToken = jwt.sign(
                { id: user._id, Role: user.Role, firstLogin: user.firstLogin },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            // Loại bỏ thông tin mật khẩu trước khi gửi response
            const { Password, ...others } = user.toObject();

            // Đặt cookie chứa token
            res.cookie("token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"

            });

            // Nếu đây là lần đăng nhập đầu tiên, trả về flag firstLogin kèm accessToken
            if (user.firstLogin) {
                return res.status(200).json({
                    message: "Bạn cần đổi mật khẩu trước khi tiếp tục",
                    user: others,
                    accessToken,
                    firstLogin: true
                });
            }

            // Trường hợp bình thường, trả về thông tin người dùng và accessToken
            return res.status(200).json({ user: others, accessToken });


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

            // const isStrongPassword = (password) => {
            //     return password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password);
            // };

            // if (!isStrongPassword(newPassword)) {
            //     return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm số và chữ hoa" });
            // }

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
