const Class = require('../models/Class');  // Import model Class
const Subject = require('../models/Subject'); // Import model Subject

const classController = {
    // Tạo lớp học mới
    createClass: async (req, res) => {
        try {
            const { Classname, subjectId, Teacher, Student, scheduleId, assignmentId, documentId } = req.body;

            // Kiểm tra xem Subject có tồn tại không
            const subjectExists = await Subject.findById(subjectId);
            if (!subjectExists) {
                return res.status(404).json({ message: "Không tìm thấy Subject" });
            }

            // Tạo Class mới
            const newClass = new Class({
                Classname,
                Subject: subjectId,
                Teacher,
                Student,
                Schedules: scheduleId,
                Assignments: assignmentId,
                Documents: documentId
            });

            // Lưu Class vào database
            const savedClass = await newClass.save();

            // Cập nhật lại danh sách các lớp trong Subject
            subjectExists.Classes.push(savedClass._id);
            await subjectExists.save();

            res.status(201).json(savedClass);
        } catch (err) {
            res.status(500).json({ message: "Tạo lớp thất bại", error: err.message });
        }
    },

    // Lấy tất cả lớp học
    getClasses: async (req, res) => {
        try {
            const classes = await Class.find().populate("Subject").populate("Teacher").populate("Student");
            res.status(200).json(classes);
        } catch (err) {
            res.status(500).json({ message: "Không tải được lớp học", error: err.message });
        }
    },

    // Lấy thông tin lớp học theo ID
    getClassById: async (req, res) => {
        try {
            const classData = await Class.findById(req.params.id)
                .populate("Subject")
                .populate("Teacher")
                .populate("Student");
                // .populate("Schedules")
                // .populate("Assignments")
                // .populate("Documents");

            if (!classData) return res.status(404).json({ message: "Không tìm thấy lớp" });

            res.status(200).json(classData);
        } catch (err) {
            res.status(500).json({ message: "Không thể tải lớp học", error: err.message });
        }
    },

    // Lấy tất cả lớp học theo Subject
    getClassesBySubject: async (req, res) => {
        try {
            const subjectId = req.params.subjectId;  // ID của Subject cần lấy các Class
            const classes = await Class.find({ Subject: subjectId })
                .populate("Subject");
                // .populate("Teacher")
                // .populate("Student")
                // .populate("Schedules")
                // .populate("Assignments")
                // .populate("Documents");

            if (classes.length === 0) {
                return res.status(404).json({ message: "Không có lớp nào trong môn này" });
            }

            res.status(200).json(classes);
        } catch (err) {
            res.status(500).json({ message: "Không thể tải lớp học", error: err.message });
        }
    },

    // Cập nhật thông tin lớp học theo ID
    updateClass: async (req, res) => {
        try {
            const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedClass) return res.status(404).json({ message: "Không tìm thấy lớp" });
            res.status(200).json(updatedClass);
        } catch (err) {
            res.status(500).json({ message: "Update-lớp thất bại", error: err.message });
        }
    },

    // Xóa lớp học theo ID
    deleteClass: async (req, res) => {
        try {
            const deletedClass = await Class.findByIdAndDelete(req.params.id);
            if (!deletedClass) return res.status(404).json({ message: "Không tìm thấy lớp" });

            // Cập nhật lại danh sách các lớp học trong Subject
            const subject = await Subject.findById(deletedClass.Subject);
            if (subject) {
                subject.Classes = subject.Classes.filter(classId => classId.toString() !== deletedClass._id.toString());
                await subject.save();
            }

            res.status(200).json({ message: "Xóa lớp thành công" });
        } catch (err) {
            res.status(500).json({ message: "Xóa thất bại", error: err.message });
        }
    }
};

module.exports = classController;
