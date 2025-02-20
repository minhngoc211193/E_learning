const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    IDUser: {type:String, required:true, unique:true},
    Fullname: {type:String, required:true},
    Username: {type:String, required:true, unique:true},
    Password: {type:String, required:true},
    Email:{type:String, required:true},
    PhoneNumber:{type:String, required:true},
    Role:{type:String, enum:["admin", "student", "teacher"], required:true},
    Gender:{type:String,enum:["Male", "Female"], required:true},
    DateOfBirth:{type:Date, required:true}
});
const User = mongoose.model("User", userSchema, "users");
module.exports = User;