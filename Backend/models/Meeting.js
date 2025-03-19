const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    User:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    Status: {type: String, enum:["schedule", "completed", "canceled"], default: "scheduled"},
    Time:{type: Date, required: true},
    Address:{type:String}
}, {timestamps: true});
const Meeting = mongoose.model("Meeting", meetingSchema, "meetings");
module.exports = Meeting;