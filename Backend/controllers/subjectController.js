const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Schedule = require('../models/Schedule');

const Document = require('../models/Document');

const subjectController = {
    //lấy toàn bộ subject
    getSubject: async (req, res) => {
        try {
            const subjects = await Subject.find().populate("Major").populate("Classes");
            res.status(200).json(subjects);
        } catch (err) {
            res.status(500).json({ message: "Không tải được môn học", error: err.message });
        }
    },

    // tạo subject
    createSubject: async (req, res) => {
        try {
            const { Name, Description, MajorId, ClassId, CodeSubject } = req.body;

            if (!Name || !Description || Name.trim().length === 0 || Description.trim().length === 0) {
                return res.status(400).json({ message: "Name or Description is required" });
            }

            // Validate Classname format (optional, example: alphanumeric with space support)
            const namePattern = /^[A-Za-z0-9\s]+$/;  // Adjust the regex as needed
            if (!namePattern.test(Name)) {
                return res.status(400).json({ message: "Name format is invalid" });
            }

            if (!namePattern.test(Description)) {
                return res.status(400).json({ message: "Description format is invalid" });
            }

            const existingCode = await Subject.findOne({ CodeSubject });
            if (existingCode) {
                return res.status(400).json({ message: `CodeSubject '${CodeSubject}' already exists`})
            }
            const codeSubjectPattern = /^[A-Za-z0-9\u00C0-\u00FF\s]+$/;  // Example regex for alphanumeric CodeSubject
            if (!codeSubjectPattern.test(CodeSubject)) {
                return res.status(400).json({ message: "CodeSubject format is invalid" });
            }
            const existingSubject = await Subject.findOne({ Name });
            if (existingSubject) {
                return res.status(400).json({ message: `Subject with name '${Name}' already exists` });
            }

            const newSubject = new Subject({ Name, Description, Major: MajorId, Classes: ClassId, CodeSubject });
            const savedSubject = await newSubject.save();
            res.status(201).json(savedSubject);
        } catch (err) {
            res.status(500).json({ message: "Failed to create subject", error: err.message });
        }
    },

    //lấy chi tiết subject
    detailSubject: async (req, res) => {
        try {
            const subject = await Subject.findById(req.params.id).populate("Major", "Name Description")
                .populate({ path: "Classes", populate: ({ path: "Teacher", select: "Fullname" }) });

            if (!subject) return res.status(404).json({ message: "Subject not found" });
            res.status(200).json(subject);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch subject", error: err.message });
        }
    },

    //lấy subject theo major
    getSubjectsByMajor: async (req, res) => {
        try {
            const majorId = req.params.majorId;  // ID của Major cần lấy các Subject
            const subjects = await Subject.find({ Major: majorId }).populate('Major').populate('Classes');

            if (subjects.length === 0) {
                return res.status(404).json({ message: "No subjects found for this major" });
            }

            res.status(200).json(subjects);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch subjects for the major", error: err.message });
        }
    },

    //cập nhật subject
    updateSubject: async (req, res) => {
        try {
            const { Name, Description, MajorId, CodeSubject } = req.body;
            if (!Name || !Description || Name.trim().length === 0 || Description.trim().length === 0) {
                return res.status(400).json({ message: "Name or Description is required" });
            }

            // Validate Classname format (optional, example: alphanumeric with space support)
            const namePattern = /^[A-Za-z0-9\u00C0-\u00FF\s]+$/;  // Adjust the regex as needed
            if (!namePattern.test(Name)) {
                return res.status(400).json({ message: "Name format is invalid" });
            }

            if (!namePattern.test(Description)) {
                return res.status(400).json({ message: "Description format is invalid" });
            }
            const existingCode = await Subject.findOne({ CodeSubject });
            if (existingCode) {
                return res.status(400).json({ message: `CodeSubject '${CodeSubject}' already exists`})
            }
            const codeSubjectPattern = /^[A-Za-z0-9\u00C0-\u00FF\s]+$/;  // Example regex for alphanumeric CodeSubject
            if (!codeSubjectPattern.test(CodeSubject)) {
                return res.status(400).json({ message: "CodeSubject format is invalid" });
            }

            const existingSubject = await Subject.findOne({
                Name,
                _id: { $ne: req.params.id }  // Exclude the current subject being updated
            });
            if (existingSubject) {
                return res.status(400).json({ message: `Subject with name '${Name}' already exists` });
            }
            const updatedSubject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedSubject) return res.status(404).json({ message: "Subject not found" });
            res.status(200).json(updatedSubject);
        } catch (err) {
            res.status(500).json({ message: "Failed to update subject", error: err.message });
        }
    },

    //xóa subject
    deleteSubject: async (req, res) => {
        try {
            const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

            if (!deletedSubject) {
                return res.status(404).json({ message: "Subject không tồn tại" });
            }
            const deletedClasses = await Class.deleteMany({ Subject: deletedSubject._id });
            const classIds = deletedClasses.map(cls => cls._id);
            await Schedule.deleteMany({ Class: { $in: classIds } });
            await Document.deleteMany({ Class: { $in: classIds } });
            const scheduleIds = await Schedule.find({ Class: { $in: classIds } }).select('_id');
            await Attendance.deleteMany({ Schedule: { $in: scheduleIds.map(sch => sch._id) } });
            res.status(200).json({ message: "Xóa lớp và các đối tượng liên quan thành công" });
        } catch (err) {
            res.status(500).json({ message: "Lỗi xóa Subject", error: err.message });
        }
    },

    searchSubject: async (req, res) => {
        try {
            const { search } = req.query;
            const subjects = await Subject.find({
                $or: [
                    { Name: { $regex: search, $options: "i" } },
                    { CodeSubject: { $regex: search, $options: "i" } }
                ]
            }).populate("Major", "Name Description");
            if (subjects.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy Subject" });
            }
            res.status(200).json(subjects);
        } catch (err) {
            res.status(500).json({ message: "Lỗi tìm kiếm Subject", error: err.message });
        }
    }
}

module.exports = subjectController;