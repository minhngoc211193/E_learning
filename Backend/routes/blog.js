const express = require('express');
const blogController = require('../controllers/blogController');
const {verifyToken, verifyAdmin} = require('../middlewares/authMiddleware');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const router = express.Router();

router.post("/create-blog", upload.single('Image'), verifyToken, blogController.createBlog);
router.get("/blogs", verifyToken, blogController.getAllBlogs);
router.get("/detail-blog/:id", verifyToken, blogController.getBlogById);
router.put("/update-blog/:id", upload.single('Image'), verifyToken, blogController.updateBlog);
router.delete("/delete-blog/:id",verifyToken, blogController.deleteBlog);
router.get("/get-blog-by-user/:id", verifyToken, blogController.getBlogByUser);
router.get("/search-blog", verifyToken, blogController.searchBlog);

module.exports = router;