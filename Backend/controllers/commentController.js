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
                return res.status(404).json({ message: "Blog does not exist" });
            }

            res.status(201).json(savedComment); // Trả về comment đã được tạo
        } catch (err) {
            res.status(500).json({ message: "Comment failed", error: err.message });
        }
    },

    // Xóa bình luận
    deleteComment: async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id);

            if (!comment) {
                return res.status(404).json({ message: "Comment does not exist" });
            }

            const blog = await Blog.findById(comment.Blog);
            if (!blog) {
                return res.status(404).json({ message: "Blog does not exist" });
            }

            if (comment.User.toString() !== req.user.id && blog.User.toString() !== req.user.id) {
                return res.status(403).json({ message: "You do not have permission to delete this comment." });
            }

            await Comment.findByIdAndDelete(req.params.id);

            await Blog.findByIdAndUpdate(comment.Blog, { $pull: { Comments: comment._id } });

            res.status(200).json({ message: "Comment deleted successfully" });
        } catch (err) {
            res.status(500).json({ message: "Comments cannot be loaded.", error: err.message });
        }
    },

    updateComment: async (req, res) => {
        try {
            // Tìm comment theo ID
            const comment = await Comment.findById(req.params.id); // Lấy thông tin người tạo bình luận

            if (!comment) {
                return res.status(404).json({ message: "No comments" });
            }

            // Kiểm tra xem người dùng có phải là chủ của bình luận không
            if (comment.User._id.toString() !== req.user.id) {
                return res.status(403).json({ message: "You do not have permission to edit this comment." });
            }

            // Cập nhật bình luận với nội dung mới
            const updatedComment = await Comment.findByIdAndUpdate(
                req.params.id, // ID của comment
                { Content: req.body.Content }, // Chỉ cập nhật nội dung comment
                { new: true } // Trả về bình luận đã được cập nhật
            );

            res.status(200).json(updatedComment); // Trả về comment đã cập nhật
        } catch (err) {
            res.status(500).json({ message: "Unable to update comment", error: err.message });
        }
    },
};

module.exports = commentController;
