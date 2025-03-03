const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router();

// Tạo mới bình luận
router.post("/create-comment", commentController.createComment);
// Lấy tất cả bình luận của một bài blog
router.get("/comments/:id", commentController.getCommentsByBlog);
// Xóa bình luận
router.delete("/delete-comment/:id", commentController.deleteComment);

module.exports = router;