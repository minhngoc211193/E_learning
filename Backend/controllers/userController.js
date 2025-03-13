const User = require('../models/User');
const Comment = require('../models/Comment')
const Blog = require('../models/Blog');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');

const userController = {
    getUser: async (req, res) => {
        try {
            const users = await User.find().select('-Password');  // Loại bỏ trường Password
    
            if (!users) {
                return res.status(404).json({ message: 'Không tìm thấy user' });
            }
    
            return res.status(200).json(users);
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi Server', error: err.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;

            // Lấy dữ liệu người dùng từ cơ sở dữ liệu
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Lấy dữ liệu từ body của yêu cầu
            const { Fullname, Username, PhoneNumber, SchoolYear, Gender, DateOfBirth, Major } = req.body;

            // Tạo đối tượng updateData ban đầu
            let updateData = { Fullname, Username, PhoneNumber, Gender, DateOfBirth, Major };

            if (user.Role === "student") {
                if (SchoolYear === undefined) {
                    return res.status(400).json({ message: 'Phải có trường SchoolYear cho học sinh' });
                }
                updateData.SchoolYear = SchoolYear;
            } else {
                // Nếu không phải student, không cho phép có SchoolYear
                delete updateData.SchoolYear;
            }

            // Xử lý trường hợp file ảnh (nếu có)
            const file = req.file;
            if (file) {
                updateData.Image = file.buffer;
            }

            // Cập nhật người dùng trong cơ sở dữ liệu
            const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-Password');
            return res.status(200).json(updatedUser);
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi Server', error: err.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;

            // Tìm người dùng theo ID
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Xóa các Comments liên quan đến người dùng
            await Comment.deleteMany({ _id: { $in: user.Comments } });

            // Xóa các Blogs liên quan đến người dùng
            await Blog.deleteMany({ _id: { $in: user.Blogs } });

            // Xóa các Meetings liên quan đến người dùng
            await Meeting.deleteMany({ _id: { $in: user.Meeting } });

            // Xóa các Notifications liên quan đến người dùng
            await Notification.deleteMany({ _id: { $in: user.Notifications } });

            // Xóa người dùng khỏi các lớp (Classes) của họ
            await User.updateMany(
                { Classes: { $in: [userId] } },
                { $pull: { Classes: userId } }
            );

            // Xóa người dùng khỏi các môn học (Subjects) của họ
            await User.updateMany(
                { Subjects: { $in: [userId] } },
                { $pull: { Subjects: userId } }
            );

            // Xóa người dùng khỏi các Meeting của họ
            await User.updateMany(
                { Meeting: { $in: [userId] } },
                { $pull: { Meeting: userId } }
            );

            // Cuối cùng, xóa người dùng khỏi cơ sở dữ liệu
            await User.findByIdAndDelete(userId);

            res.status(200).json({ message: 'Người dùng đã bị xóa cùng với các liên kết liên quan' });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi Server', error: err.message });
        }
    },

    detailUser: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-Password')
                .populate([
                    'Major',
                    'Classes',
                    'Subjects'
                ]);
    
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy user' });
            }
    
            return res.status(200).json(user);
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi Server', error: err.message });
        }
    }
};

module.exports = userController;