const mongoose = require('mongoose');

// Attendance Schema (lưu điểm danh cho mỗi sinh viên)
const attendanceSchema = new mongoose.Schema({
    Schedule: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Schedule",  // Tham chiếu đến buổi học
        required: true 
    },
    Teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Tham chiếu đến giáo viên
        required: true
    },
    Student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Tham chiếu đến sinh viên
        required: true
    },
    IsPresent: { 
        type: String,
        enum: ["absent", "pending", "attended"],  // Trạng thái điểm danh
        required: true, 
        default: "pending" // Mặc định là "pending" cho đến khi giáo viên điểm danh
    },
    Comment: {
        type: String, // Lý do vắng mặt hoặc nhận xét khác
        required: false
    },
    Date: {
        type: Date,  // Ngày điểm danh
        required: true
    }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema, 'attendances');

module.exports = Attendance;
