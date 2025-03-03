const Blog = require("../models/Blog");

const blogController = {
    createBlog: async (req, res) => {
        try {
            const { Title, Content, Image, User } = req.body;
            const newBlog = new Blog({ Title, Content, Image, User });
            const savedBlog = await newBlog.save();
            res.status(201).json(savedBlog);
        } catch (err) {
            res.status(500).json({ message: "Failed to create blog", error: err.message });
        }
    },

    getAllBlogs: async (req, res) => {
        try {
            const blogs = await Blog.find().populate("User");
            res.status(200).json(blogs);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch blogs", error: err.message });
        }
    },

    getBlogById: async (req, res) => {
        try {
            const blog = await Blog.findById(req.params.id).populate("User").populate("Comment");
            if (!blog) return res.status(404).json({ message: "Blog not found" });
            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch blog", error: err.message });
        }
    },

    updateBlog: async (req, res) => {
        try {
            const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
            res.status(200).json(updatedBlog);
        } catch (err) {
            res.status(500).json({ message: "Failed to update blog", error: err.message });
        }
    },

    deleteBlog: async (req, res) => {
        try {
            const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
            if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
            res.status(200).json({ message: "Blog deleted successfully" });
        } catch (err) {
            res.status(500).json({ message: "Failed to delete blog", error: err.message });
        }
    }
};

module.exports = blogController;