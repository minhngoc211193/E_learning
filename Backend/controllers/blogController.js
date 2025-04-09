const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const mime = require('mime-types');


const blogController = {

    //tạo blog
    createBlog: async (req, res) => {
        try {
            const { Title, Content, User } = req.body;
            const file = req.file;
            if (file) {
                // Kiểm tra loại file ảnh
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (!allowedTypes.includes(file.mimetype)) {
                    return res.status(400).json({ message: 'You can only upload files (jpg, jpeg, png)' });
                }
    
                // Kiểm tra kích thước file (3MB) trong controller
                const maxSize = 3 * 1024 * 1024; // 3MB
                if (file.size > maxSize) {
                    return res.status(400).json({ message: 'File size exceeded limit (3MB)' });
                }
            }

            if (!User) return res.status(400).json({ message: "User not pound" });
            const newBlog = new Blog({ Title, Content, User, Image: file.buffer });
            const savedBlog = await newBlog.save();

            const io = req.app.get('io');
            io.emit('newBlog', savedBlog);

            res.status(201).json(savedBlog);
        } catch (err) {
            res.status(500).json({ message: "Failed to create blog", error: err.message });
        }
    },

    // get all blog
    getAllBlogs: async (req, res) => {
        try {
            const blogs = await Blog.find().populate("User", "Fullname Role Email");

            const blogsWithImage = blogs.map(blog => {
                let imageBase64 = null;
                if (blog.Image) {
                    const mimeType = mime.lookup(blog.Image) || 'image/png'; 
                    imageBase64 = `data:${mimeType};base64,${blog.Image.toString('base64')}`;
                }

                return {
                    ...blog.toObject(),
                    Image: imageBase64
                }
            });

            return res.status(200).json(blogsWithImage);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch blogs", error: err.message });
        }
    },

    // blog detail
    getBlogById: async (req, res) => {
        try {
            const blog = await Blog.findById(req.params.id)
                .populate({
                    path: 'User',
                    select: 'Fullname Image'  // Lấy cả 'Fullname' và 'Image' của người viết blog
                })
                .populate({
                    path: 'Comments',
                    populate: {
                        path: 'User',
                        select: 'Fullname Image'  // Lấy cả 'Fullname' và 'Image' của người bình luận
                    }
                });
    
            if (!blog) return res.status(404).json({ message: "Blog not found" });
    
            // Nếu có ảnh của blog, chuyển đổi từ Buffer sang Base64
            let imageBase64 = null;
            if (blog.Image) {
                const mimeType = mime.lookup(blog.Image) || 'image/png'; // Bạn có thể thay 'image/png' bằng kiểu MIME đúng nếu cần
                imageBase64 = `data:${mimeType};base64,${blog.Image.toString('base64')}`;
            }
    
            // Chuyển đổi ảnh của chủ blog (người viết blog) từ Buffer sang Base64
            let userImageBase64 = null;
            if (blog.User.Image) {
                const mimeType = mime.lookup(blog.User.Image) || 'image/png'; // Kiểu MIME mặc định
                userImageBase64 = `data:${mimeType};base64,${blog.User.Image.toString('base64')}`;
            }
    
            // Chuyển đổi ảnh của từng người bình luận từ Buffer sang Base64
            const commentsWithImage = blog.Comments.map(comment => {
                let commentImageBase64 = null;
                if (comment.User.Image) {
                    const mimeType = mime.lookup(comment.User.Image) || 'image/png';  // Kiểu MIME mặc định
                    commentImageBase64 = `data:${mimeType};base64,${comment.User.Image.toString('base64')}`;
                }
    
                // Thêm ảnh dưới dạng Base64 vào bình luận
                return {
                    ...comment.toObject(),
                    User: {
                        ...comment.User.toObject(),
                        Image: commentImageBase64
                    }
                };
            });
    
            res.status(200).json({
                ...blog.toObject(),
                Image: imageBase64,
                User: {
                    ...blog.User.toObject(),
                    Image: userImageBase64 // Thêm ảnh người viết blog đã chuyển sang Base64
                },
                Comments: commentsWithImage  // Trả về các bình luận với ảnh đã được chuyển đổi
            });
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch blog", error: err.message });
        }
    },

    updateBlog: async (req, res) => {
        try {
            // Lấy blog theo ID
            const blog = await Blog.findById(req.params.id);

            if (!blog) {
                return res.status(404).json({ message: "Blog not found" });
            }

            // Kiểm tra xem user có phải là người tạo blog không
            if (blog.User.toString() !== req.body.User.toString()) {
                return res.status(403).json({ message: "You do not have permission to edit this blog post because this is not your blog." });
            }

            const { Title, Content, User } = req.body;

            let updateData = { Title, Content, User };

            const file = req.file;
            if (file) {
                // Kiểm tra loại file ảnh
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (!allowedTypes.includes(file.mimetype)) {
                    return res.status(400).json({ message: 'You can only upload files (jpg, jpeg, png)' });
                }
    
                // Kiểm tra kích thước file (3MB) trong controller
                const maxSize = 3 * 1024 * 1024; // 3MB
                if (file.size > maxSize) {
                    return res.status(400).json({ message: 'File size exceeded limit (3MB)' });
                }
                updateData.Image = file.buffer;
            }

            // Cập nhật blog
            const updatedBlog = await Blog.findByIdAndUpdate(blog, updateData, { new: true });
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
                return res.status(404).json({ message: "Blog does not exist" });
            }

            // Kiểm tra xem người dùng hiện tại có phải là người tạo blog không
            if (blog.User.toString() !== req.user.id && req.user.Role !== 'admin') {
                return res.status(403).json({ message: "You do not have permission to delete this blog post." });
            }

            // Xóa tất cả các comment liên quan đến blog này
            await Comment.deleteMany({ Blog: blog._id });

            // Sau khi xóa các comment, xóa blog
            await Blog.findByIdAndDelete(req.params.id);

            const io = req.app.get('io');
            io.emit('deleteBlog', req.params.id);

            res.status(200).json({ message: "Deleted blog and related comments successfully" });
        } catch (err) {
            res.status(500).json({ message: "Unable to delete blog", error: err.message });
        }
    },

    getBlogByUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const blogs = await Blog.find({ User: userId }).populate("User", "Fullname Role Email");

            const blogsWithImage = blogs.map(blog => {
                let imageBase64 = null;
                if (blog.Image) {
                    const mimeType = mime.lookup(blog.Image) || 'image/png';
                    imageBase64 = `data:${mimeType};base64,${blog.Image.toString('base64')}`;
                }

                return {
                    ...blog.toObject(),
                    Image: imageBase64
                }
            });

            return res.status(200).json(blogsWithImage);
        } catch (err) {
            res.status(500).json({ message: "Unable to get user blogs", error: err.message });
        }
    },

    searchBlog: async (req, res) => {
        try {
            const {search} = req.query;
            if (!search) {
                return res.status(400).json({ message: "Please provide search keywords" });
            }
            const blogs = await Blog.find({ Title: { $regex: search, $options: "i" } })
                .populate("User", "Fullname Role Email");
            if (blogs.length === 0) {
                return res.status(404).json({ message: "No Blogs Found" });
            }

            const blogWithImage = blogs.map(blog => {
                let imageBase64 = null;
                if (blog.Image) {
                    const mimeType = mime.lookup(blog.Image) || 'image/png';  // Lấy loại ảnh
                    imageBase64 = `data:${mimeType};base64,${blog.Image.toString('base64')}`;
                }

                return {
                    ...blog.toObject(),
                    Image: imageBase64
                };
            });
            return res.status(200).json(blogWithImage);
        } catch (err) {
            res.status(500).json({ message: "Search error", error: err.message });
        }
    }
};

module.exports = blogController;