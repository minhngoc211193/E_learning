const User = require('../models/User');
const Comment = require('../models/Comment')
const Blog = require('../models/Blog');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const mime = require('mime-types');
const Major = require('../models/Major');

const userController = {
    getUser: async (req, res) => {
        try {
            const users = await User.find().select('-Password');  // Loại bỏ trường Password

            if (!users) {
                return res.status(404).json({ message: 'Không tìm thấy user' });
            }

            // Xử lý ảnh cho từng người dùng
            const usersWithImage = users.map(user => {
                // Chuyển ảnh Buffer thành base64 nếu có ảnh
                let imageBase64 = null;
                if (user.Image) {
                    const mimeType = mime.lookup(user.Image) || 'image/png'; // Lấy loại ảnh
                    imageBase64 = `data:${mimeType};base64,${user.Image.toString('base64')}`;
                }

                // Trả về user info và ảnh base64
                return {
                    ...user.toObject(),
                    Image: imageBase64
                };
            });

            return res.status(200).json(usersWithImage);

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
            const { Fullname, PhoneNumber, SchoolYear, Gender, DateOfBirth, Major } = req.body;

            // Tạo đối tượng updateData ban đầu
            let updateData = { Fullname, PhoneNumber, Gender, DateOfBirth, Major };

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
                .populate(['Major', 'Classes', 'Subjects']);

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy user' });
            }

            // Chuyển ảnh Buffer thành base64 nếu có ảnh
            let imageBase64 = null;
            if (user.Image) {
                const mimeType = mime.lookup(user.Image) || 'image/png'; // Lấy loại ảnh
                imageBase64 = `data:${mimeType};base64,${user.Image.toString('base64')}`;
            }

            // Trả về cả user info và ảnh base64
            return res.status(200).json({
                ...user.toObject(),
                Image: imageBase64
            });
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi Server', error: err.message });
        }
    },

    getUserByMajor: async (req, res) => {
        try {
            const { id } = req.params;
            const { Role } = req.query;  // role sẽ được truyền qua query string (ví dụ: /users-by-major/:majorId?role=teacher)

            // Kiểm tra xem role có phải là "teacher" hoặc "student" không
            if (Role && !['teacher', 'student'].includes(Role)) {
                return res.status(400).json({ message: 'Role không hợp lệ. Chỉ chấp nhận teacher hoặc student.' });
            }

            // Tìm Major để xác định các User trong Major này
            const major = await Major.findById(id);
            if (!major) {
                return res.status(404).json({ message: 'Không tìm thấy Major này' });
            }

            // Tìm người dùng theo Major và Role
            const users = await User.find({
                Major: id,  // Tìm theo Major
                Role: Role || { $in: ['teacher', 'student'] }  // Nếu role không được truyền vào thì tìm tất cả các teacher và student
            });

            // Nếu không có người dùng nào
            if (users.length === 0) {
                return res.status(404).json({ message: 'Không có người dùng nào trong Major này với Role đã chọn' });
            }

            res.status(200).json(users);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Lỗi khi truy vấn dữ liệu', error: err.message });
        }
    },

    searchUser: async (req, res) => {
        try {
            const { search } = req.query;  // Nhận từ khóa tìm kiếm từ query string

            if (!search) {
                return res.status(400).json({ message: 'Vui lòng cung cấp từ khóa tìm kiếm' });
            }

            // Tìm người dùng theo Fullname hoặc Username, sử dụng Regular Expression (i.e., case-insensitive search)
            const users = await User.find({
                $or: [
                    { Fullname: { $regex: search, $options: 'i' } },  // Tìm theo Fullname, không phân biệt chữ hoa/thường
                    { Username: { $regex: search, $options: 'i' } }   // Tìm theo Username, không phân biệt chữ hoa/thường
                ]
            }).select('-Password');  // Loại bỏ trường Password

            if (users.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng nào' });
            }

            // Xử lý ảnh cho từng người dùng nếu có
            const usersWithImage = users.map(user => {
                let imageBase64 = null;
                if (user.Image) {
                    const mimeType = mime.lookup(user.Image) || 'image/png';  // Lấy loại ảnh
                    imageBase64 = `data:${mimeType};base64,${user.Image.toString('base64')}`;
                }

                return {
                    ...user.toObject(),
                    Image: imageBase64
                };
            });

            // Trả về danh sách người dùng phù hợp với từ khóa tìm kiếm
            return res.status(200).json(usersWithImage);
        } catch (err) {
            return res.status(500).json({ message: 'Lỗi tìm kiếm', error: err.message });
        }
    }
};

module.exports = userController;