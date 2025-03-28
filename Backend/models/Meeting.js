const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    meetingType: { type: String, enum: ["online", "offline"], required: true },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    time: { type: Date, required: true },
    address: { type: String },
    meetingUrl: { type: String }
}, { timestamps: true });

const Meeting = mongoose.model("Meeting", meetingSchema, "meetings");
module.exports = Meeting;
