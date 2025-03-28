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
                .populate({path: "Classes", populate: ({path:"Teacher", select: "Fullname"})});

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

            if(!deletedSubject){
                return res.status(404).json({message: "Subject không tồn tại"});
            }

            await Class.deleteMany({Subject: deletedSubject._id});

            // xóa cả những thứ liên quan đến các class bị xóa cùng subject
            await Schedule.deleteMany({ Class: { $in: deletedSubject.Classes } });

            await Document.deleteMany({ Class: { $in: deletedSubject.Classes } });

            res.status(200).json({ message: "Xóa lớp và các đối tượng liên quan thành công" });
        } catch (err) {
            res.status(500).json({ message: "Lỗi xóa Subject", error: err.message });
        }
    },

    searchSubject: async (req, res) => {
        try{
            const { search } = req.query;
            const subjects = await Subject.find({
                $or: [
                    { Name: { $regex: search, $options: "i" } },
                    { CodeSubject: { $regex: search, $options: "i" } }
                ]
            }).populate("Major", "Name Description");
            if(subjects.length === 0){
                return res.status(404).json({message: "Không tìm thấy Subject"});
            }
            res.status(200).json(subjects);
        } catch (err) {
            res.status(500).json({ message: "Lỗi tìm kiếm Subject", error: err.message });
        }
    }
}

module.exports = subjectController;