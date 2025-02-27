const express = require('express');
const blogController = require('../controllers/blogController');

const router = express.Router();

router.post("/create-blog", blogController.createBlog);
router.get("/blogs", blogController.getAllBlogs);
router.get("/detail-blog/:id", blogController.getBlogById);
router.put("/update-blog/:id", blogController.updateBlog);
router.delete("/delete-blog/:id", blogController.deleteBlog);

module.exports = router;