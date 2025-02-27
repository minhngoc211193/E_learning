const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
    registerUser: async (req, res) => {
        try {

            const { Fullname, Username, Password, DateOfBirth, Gender, Role, Major, Email, PhoneNumber } = req.body;

            // Check if username or email exists
            const existingUser = await User.findOne({ $or: [{ Username }, { Email }] });
            if (existingUser) {
                return res.status(400).json({ message: "Username or email already exists" });
            }
            if ((Role === 'student' || Role === 'teacher') && !Major) {
                return res.status(400).json({ message: "Major is required for student or teacher roles" });
            }
            // Hash password
            const hashedPassword = await bcrypt.hash(Password, 10);
            // Create user
            const newUserData = {
                Fullname,
                Username,
                Password: hashedPassword,
                DateOfBirth,
                Gender,
                Role: Role || "student",  // Nếu không có Role, mặc định là "student"
                Major: (Role === 'student' || Role === 'teacher') ? Major : null,
                Email,
                PhoneNumber

            };

            // Gán SchoolYear mặc định là 1 nếu Role là 'student'
            if (newUserData.Role === "student") {
                newUserData.SchoolYear = 1;  // Gán mặc định cho trường SchoolYear
            }
    
            // Tạo người dùng mới
            const newUser = new User(newUserData);
    
            // Lưu người dùng vào cơ sở dữ liệu
            const user = await newUser.save();
            res.status(201).json({ message: "User registered successfully", user });
        } catch (err) {
            res.status(500).json({ message: "Registration failed", error: err.message });
        }
    },

    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({Email:req.body.Email});
            if(!user){
                return res.status(400).json({message:"User not found"});
            }
            const validPassword = await bcrypt.compare(req.body.Password, user.Password);
            if(!validPassword){
                return res.status(400).json({message:"Incorrect password"});
            }
            if(user && validPassword){
                const accessToken = jwt.sign(
                    { id: user._id, Role: user.Role },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );
                const {Password, ...others} = user._doc;
                res.status(200).json({...others, accessToken});
            }
        }
        catch (err) {
            console.error("❌ Login Error:", err); // Thêm log để debug
            res.status(500).json({ message: "Login failed", error: err.message });
        }
    },
}

module.exports = authController;