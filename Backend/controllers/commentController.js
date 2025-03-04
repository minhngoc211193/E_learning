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
    // getCommentsByBlog: async (req, res) => {
    //     try {
    //         const blog = await Blog.findById(req.params.id).populate('Comments');
    //         if (!blog) return res.status(404).json({ message: "Không có Blog" });

    //         res.status(200).json(blog.Comments);
    //     } catch (err) {
    //         res.status(500).json({ message: "Không tải được comment", error: err.message });
    //     }
    // },

    // Xóa bình luận
    deleteComment: async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id);

            if(!comment) {
                return res.status(404).json({ message: "Comment không tồn tại" });
            }

            if(comment.User.toString() !== req.user.id) {
                return res.status(403).json({ message: "Bạn không có quyền xóa comment này" });
            }

            await Comment.findByIdAndDelete(req.params.id);

            await Blog.findByIdAndUpdate(comment.Blog, { $pull: { Comments: comment._id } });
            
            res.status(200).json({ message: "Xóa comment thành công" });
        } catch (err) {
            res.status(500).json({ message: "Không tải được comment", error: err.message });
        }
    },

    updateComment: async (req, res) => {
        try {
            // Tìm comment theo ID
            const comment = await Comment.findById(req.params.id); // Lấy thông tin người tạo bình luận
    
            if (!comment) {
                return res.status(404).json({ message: "Không có comment" });
            }
    
            // Kiểm tra xem người dùng có phải là chủ của bình luận không
            if (comment.User._id.toString() !== req.user.id) {
                return res.status(403).json({ message: "Bạn không có quyền sửa bình luận này" });
            }
    
            // Cập nhật bình luận với nội dung mới
            const updatedComment = await Comment.findByIdAndUpdate(
                req.params.id, // ID của comment
                { Content: req.body.Content }, // Chỉ cập nhật nội dung comment
                { new: true } // Trả về bình luận đã được cập nhật
            );
    
            res.status(200).json(updatedComment); // Trả về comment đã cập nhật
        } catch (err) {
            res.status(500).json({ message: "Không thể cập nhật comment", error: err.message });
        }
    },
};

module.exports = commentController;
