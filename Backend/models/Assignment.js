const mongoose = require('mongoose');
const assignmentSchema = new mongoose.Schema({
    Title: {type: String, required: true},
    Document:{type: String, required: true},
    Deadline:{type: Date, required: true},
    Class:{type: mongoose.Schema.Types.ObjectId, required: true}
}, {timestamps: true});

const Assignment = mongoose.model("Assignment", assignmentSchema, "assignments");
module.exports = Assignment;
