const mongoose = require('mongoose');
const scheduleSchema = new mongoose.Schema({
    Address:{type: String, enum:["G401", "G402", "G403", "G404"], required:true},
    Slot:{type:String, enum:["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5"], required:true},
    Class:{type: mongoose.Schema.Types.ObjectId, ref: "Class"}
}, {timestamps: true} );
const Schedule = mongoose.model('Schedule', scheduleSchema , "schedules");
module.exports = Schedule;