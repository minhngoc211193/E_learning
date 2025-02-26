const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
    registerUser: async (req, res) => {
        try {
            const { Fullname, Username, Password, DateOfBirth, Gender, Role, Major, Email } = req.body;
            // Check if username or email exists
            const existingUser = await User.findOne({ $or: [{ Username }, { Email }] });
            if (existingUser) {
                return res.status(400).json({ message: "Username or email already exists" });
            }
            // Hash password
            const hashedPassword = await bcrypt.hash(Password, 10);
            // Create user
            const newUser = new User({
                Fullname,
                Username,
                Password: hashedPassword,
                DateOfBirth,
                Gender,
                Role: Role || "student",
                Major,
                Email
            });
            // Save to database
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