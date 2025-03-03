const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

const commentController = {
    // Thêm bình luận
    createComment: async (req, res) => {
        try {
            const { Content, User, Blog: blogId } = req.body; // Chú ý thay đổi tên biến từ `Blog` thành `blogId` để tránh xung đột

            // Tạo mới comment
            const newComment = new Comment({ Content, User, Blog: blogId });

            // Lưu comment vào database
            const savedComment = await newComment.save();

            // Cập nhật Blog với bình luận mới
            const updatedBlog = await Blog.findByIdAndUpdate(
                blogId, // Sử dụng ID của blog
                { $push: { Comments: savedComment._id } }, // Thêm bình luận vào mảng Comments của Blog
                { new: true } // Trả về blog đã được cập nhật
            );

            if (!updatedBlog) {
                return res.status(404).json({ message: "Blog không tồn tại" });
            }

            res.status(201).json(savedComment); // Trả về comment đã được tạo
        } catch (err) {
            res.status(500).json({ message: "Comment thất bại", error: err.message });
        }
    },

    // Lấy tất cả bình luận của một bài blog
    getCommentsByBlog: async (req, res) => {
        try {
            const blog = await Blog.findById(req.params.id).populate('Comments');
            if (!blog) return res.status(404).json({ message: "Không có Blog" });

            res.status(200).json(blog.Comments);
        } catch (err) {
            res.status(500).json({ message: "Không tải được comment", error: err.message });
        }
    },

    // Xóa bình luận
    deleteComment: async (req, res) => {
        try {
            const comment = await Comment.findByIdAndDelete(req.params.id);
            if (!comment) return res.status(404).json({ message: "Không có comment" });
            
            // Cập nhật lại blog sau khi xóa bình luận
            await Blog.findByIdAndUpdate(comment.Blog, { $pull: { Comments: comment._id } });
            
            res.status(200).json({ message: "Xóa comment thành công" });
        } catch (err) {
            res.status(500).json({ message: "Không tải được comment", error: err.message });
        }
    }
};

module.exports = commentController;
