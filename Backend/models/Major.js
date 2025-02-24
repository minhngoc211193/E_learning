const mongoose = require('mongoose');
const majorSchema = new mongoose.Schema({
    Name:{type:String, required:true, unique: true},
    Description:{type:String, required:true},
    Users:[{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    Subjects:[{type: mongoose.Schema.Types.ObjectId, ref: "Subject"}]
})
const Major = mongoose.model("Major", majorSchema, "majors");

module.exports = Major;