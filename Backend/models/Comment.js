const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    Content: {type: String, required:true},
    User:{type: mongoose.Schema.Types.ObjectId, ref:"User"},
    Blog: {type: mongoose.Schema.Types.ObjectId, ref:"Blog"}
}, {timestamps: true});
const Comment = mongoose.model("Comment", commentSchema, "comments");
module.exports = Comment;