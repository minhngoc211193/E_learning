const mongoose = require('mongoose');
const subjectSchema = new mongoose.Schema({
    Name: {type: String, required: true, unique:true},
    Description:{type: String},
    Major:{type: mongoose.Schema.Types.ObjectId, ref:"Major"},
    Classes:[{type: mongoose.Schema.Types.ObjectId, ref:"Class"}]
});

const Subject = mongoose.model("Subject", subjectSchema, "subjects");

module.exports = Subject;