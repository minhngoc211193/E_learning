const User = require('../models/User');

const userController = {
    getUser: async (req, res) => {
        try {
            const users = await User.find().select('-Password');  // Loại bỏ trường Password
    
            if (!users) {
                return res.status(404).json({ message: 'No users found' });
            }
    
            return res.status(200).json(users);
        } catch (err) {
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const { Fullname, Username, PhoneNumber, SchoolYear, Role, Gender, DateOfBirth, Major } = req.body;
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { Fullname, Username, PhoneNumber, SchoolYear, Role, Gender, DateOfBirth, Major },
                { new: true, runValidators: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: 'Không tìm thấy User' });
            }
            return res.status(200).json(updatedUser);
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi Server', error: err.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (err) {
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    },

    detailUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
                .populate([
                    'Major',
                    'Classes',
                    'Subjects'
                ]);
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            return res.status(200).json(user);
        } catch (err) {
            return res.status(500).json({ message: 'Server error', error: err.message });
        }
    }
};

module.exports = userController;