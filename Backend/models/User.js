const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Fullname: {type:String, required:true},
    Username: {type:String, required:true, unique:true},
    Password: {type:String, required:true},
    Email:{type:String, required:true, unique:true},
    PhoneNumber:{type:Number, unique:true},
    Role:{type:String, enum:["admin", "student", "teacher"], required:true},
    Gender:{type:String,enum:["Male", "Female"], required:true},
    DateOfBirth:{type:Date},
    Major:{type:mongoose.Schema.Types.ObjectId, ref: "Major"},
    SchoolYear:{type:Number, required: function(){return this.Role ==="student"}},
    Classes: [{type: mongoose.Schema.Types.ObjectId, ref:"Class"}],
    Subjects: [{type: mongoose.Schema.Types.ObjectId, ref:"Subject"}],
    Blogs: [{type: mongoose.Schema.Types.ObjectId, ref:"Blog"}],
    Comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
    Meeting: [{type: mongoose.Schema.Types.ObjectId, ref:"Meeting"}],
    Notifications: [{type: mongoose.Schema.Types.ObjectId, ref:"Notification"}]
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;


