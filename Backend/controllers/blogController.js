const Blog = require("../models/Blog");
const Comment = require("../models/Comment");

const blogController = {

    //tạo blog
    createBlog: async (req, res) => {
        try {
            const { Title, Content, Image, User } = req.body;

            if(!User) return res.status(400).json({ message: "Không có UserId" });
            const newBlog = new Blog({ Title, Content, Image, User });
            const savedBlog = await newBlog.save();
            res.status(201).json(savedBlog);
        } catch (err) {
            res.status(500).json({ message: "Failed to create blog", error: err.message });
        }
    },

    // get all blog
    getAllBlogs: async (req, res) => {
        try {
            const blogs = await Blog.find().populate("User", "Fullname Role Email");
            res.status(200).json(blogs);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch blogs", error: err.message });
        }
    },

    // blog detail
    getBlogById: async (req, res) => {
        try {
            const blog = await Blog.findById(req.params.id).populate({path:'User', select:'Fullname'}).populate({path: 'Comments', populate:{path: 'User', select:'Fullname'}});
            if (!blog) return res.status(404).json({ message: "Blog not found" });
            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch blog", error: err.message });
        }
    },

    updateBlog: async (req, res) => {
        try {
            // Lấy blog theo ID
            const blog = await Blog.findById(req.params.id);

            if (!blog) {
                return res.status(404).json({ message: "Không thấy Blog" });
            }

            // Kiểm tra xem user có phải là người tạo blog không
            if (blog.User.toString() !== req.body.User.toString()) {
                return res.status(403).json({ message: "Bạn không có quyền sửa bài blog này vì đây không phải blog của bạn" });
            }

            // Cập nhật blog
            const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.status(200).json(updatedBlog);
        } catch (err) {
            res.status(500).json({ message: "Failed to update blog", error: err.message });
        }
    },

    deleteBlog: async (req, res) => {
        try {
            // Tìm blog theo ID
            const blog = await Blog.findById(req.params.id);
    
            if (!blog) {
                return res.status(404).json({ message: "Blog không tồn tại" });
            }
    
            // Kiểm tra xem người dùng hiện tại có phải là người tạo blog không
            if (blog.User.toString() !== req.user.id && req.user.Role !== 'admin') {
                return res.status(403).json({ message: "Bạn không có quyền xóa bài blog này" });
            }
    
            // Xóa tất cả các comment liên quan đến blog này
            await Comment.deleteMany({ Blog: blog._id });
    
            // Sau khi xóa các comment, xóa blog
            await Blog.findByIdAndDelete(req.params.id);
    
            res.status(200).json({ message: "Xóa blog và các bình luận liên quan thành công" });
        } catch (err) {
            res.status(500).json({ message: "Không thể xóa blog", error: err.message });
        }
    }
    
};

module.exports = blogController;