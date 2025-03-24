const express = require('express');
const blogController = require('../controllers/blogController');
const {verifyToken, verifyAdmin} = require('../middlewares/authMiddleware');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // Giới hạn kích thước file là 1MB (1MB = 1 * 1024 * 1024 bytes)
    fileFilter: (req, file, cb) => {
        // Kiểm tra loại file là ảnh (jpg, jpeg, png)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Bạn chỉ có thể tải lên file (jpg, jpeg, png)'));
        }
        cb(null, true); // Tiếp tục nếu đúng loại file
    }
});



const router = express.Router();

router.post("/create-blog", upload.single('Image'), verifyToken, blogController.createBlog);
router.get("/blogs", verifyToken, blogController.getAllBlogs);
router.get("/detail-blog/:id", verifyToken, blogController.getBlogById);
router.put("/update-blog/:id", upload.single('Image'), verifyToken, blogController.updateBlog);
router.delete("/delete-blog/:id",verifyToken, blogController.deleteBlog);
router.get("/get-blog-by-user/:id", verifyToken, blogController.getBlogByUser);

module.exports = router;