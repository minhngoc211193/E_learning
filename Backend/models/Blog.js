const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
    Title:{type: String, required: true},
    Content : {type: String, required: true},
    Image: {type: String, required: true},
    User: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
    Comments:[{type: mongoose.Schema.Types.ObjectId, ref:"Comment"}]
}, {timestamps: true}); 
//tự đông tạo createAt và updateAt bằng timestamps
const Blog = mongoose.model("Blog", blogSchema, "blogs");
module.exports = Blog;