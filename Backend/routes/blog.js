const express = require('express');
const blogController = require('../controllers/blogController');
const {verifyToken, varifyAdmin} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/create-blog", verifyToken, blogController.createBlog);
router.get("/blogs", verifyToken, blogController.getAllBlogs);
router.get("/detail-blog/:id", verifyToken, blogController.getBlogById);
router.put("/update-blog/:id", verifyToken, blogController.updateBlog);
router.delete("/delete-blog/:id",verifyToken, blogController.deleteBlog);

module.exports = router;