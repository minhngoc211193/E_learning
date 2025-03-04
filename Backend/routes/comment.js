const express = require('express');
const commentController = require('../controllers/commentController');
const {verifyToken, verifyAdmin} = require('../middlewares/authMiddleware');

const router = express.Router();

// Tạo mới bình luận
router.post("/create-comment", verifyToken, commentController.createComment);
// Lấy tất cả bình luận của một bài blog
// router.get("/comments/:id", commentController.getCommentsByBlog);
// Xóa bình luận
router.delete("/delete-comment/:id", verifyToken, commentController.deleteComment);
router.put("/update-comment/:id", verifyToken, commentController.updateComment);

module.exports = router;