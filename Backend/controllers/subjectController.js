const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Schedule = require('../models/Schedule');
const Document = require('../models/Document');

const subjectController = {
    getSubject: async (req, res) => {
        try {
            const subjects = await Subject.find().populate("Major").populate("Classes");
            res.status(200).json(subjects);
        } catch (err) {
            res.status(500).json({ message: "Failed to get Subject ", error: err.message });
        }
    },

    createSubject: async (req, res) => {
        try {
            const { Name, Description, MajorId, ClassId, CodeSubject } = req.body;

            if (!Name || !Description || Name.trim().length === 0 || Description.trim().length === 0) {
                return res.status(400).json({ message: "Name and Description cannot be empty" });
            }

            const namePattern = /^[A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF\u2C00-\u2C5F\u0370-\u03FF\s.]+$/;
            if (!namePattern.test(Name)) {
                return res.status(400).json({ message: "Name can only contain letters, numbers, and spaces and accented characters" });
            }

            if (!namePattern.test(Description)) {
                return res.status(400).json({ message: "Description can only contain letters, numbers, and spaces and accented characters" });
            }

            const existingCode = await Subject.findOne({ CodeSubject }).collation({ locale: 'en', strength: 2 });
            if (existingCode) {
                return res.status(400).json({ message: `CodeSubject '${CodeSubject}' already exists`})
            }
            const codeSubjectPattern = /^[A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF\u2C00-\u2C5F\u0370-\u03FF\s]+$/;
            if (!codeSubjectPattern.test(CodeSubject)) {
                return res.status(400).json({ message: "CodeSubject can only accept letters, numbers, spaces and accented characters" });
            }
            const existingSubject = await Subject.findOne({ Name }).collation({ locale: 'en', strength: 2 });
            if (existingSubject) {
                return res.status(400).json({ message: `Subject with name '${Name}' already exists` });
            }

            const newSubject = new Subject({ Name, Description, Major: MajorId, Classes: ClassId, CodeSubject });
            const savedSubject = await newSubject.save();

            const io = req.app.get('io');
            io.emit('newSubject', savedSubject);

            res.status(201).json(savedSubject);
        } catch (err) {
            res.status(500).json({ message: "Failed to create subject", error: err.message });
        }
    },

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

    getSubjectsByMajor: async (req, res) => {
        try {
            const majorId = req.params.majorId;
            const subjects = await Subject.find({ Major: majorId }).populate('Major').populate('Classes');

            if (subjects.length === 0) {
                return res.status(404).json({ message: "No subjects found for this major" });
            }

            res.status(200).json(subjects);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch subjects for the major", error: err.message });
        }
    },

    updateSubject: async (req, res) => {
        try {
            const { Name, Description, MajorId, CodeSubject } = req.body;
            
            if (!Name || !Description || Name.trim().length === 0 || Description.trim().length === 0) {
                return res.status(400).json({ message: "Name and Description cannot be empty" });
            }
    
            const namePattern = /^[A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF\u2C00-\u2C5F\u0370-\u03FF\s.]+$/;
            if (!namePattern.test(Name)) {
                return res.status(400).json({ message: "Name can only contain letters, numbers, and spaces and accented characters" });
            }
    
            if (!namePattern.test(Description)) {
                return res.status(400).json({ message: "Description can only contain letters, numbers, and spaces and accented characters" });
            }
            const codeSubjectPattern = /^[A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF\u2C00-\u2C5F\u0370-\u03FF\s]+$/;
            if (!codeSubjectPattern.test(CodeSubject)) {
                return res.status(400).json({ message: "CodeSubject can only accept letters, numbers, spaces and accented characters" });
            }
            const existingSubject = await Subject.findById(req.params.id);
            if (!existingSubject) {
                return res.status(404).json({ message: "Subject not found" });
            }
            
            if (existingSubject.CodeSubject.toLowerCase() !== CodeSubject.toLowerCase()) {
                const existingCode = await Subject.findOne({ CodeSubject }).collation({ locale: 'en', strength: 2 });
                if (existingCode) {
                    return res.status(400).json({ message: `CodeSubject '${CodeSubject}' already exists` });
                }
            }
    
            if (existingSubject.Name.toLowerCase() !== Name.toLowerCase()) {
                const duplicateName = await Subject.findOne({
                    Name,
                    _id: { $ne: req.params.id }
                }).collation({ locale: 'en', strength: 2 });
                if (duplicateName) {
                    return res.status(400).json({ message: `Subject with name '${Name}' already exists` });
                }
            }
    
            const updatedSubject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.status(200).json(updatedSubject);
        } catch (err) {
            res.status(500).json({ message: "Failed to update subject", error: err.message });
        }
    },

    deleteSubject: async (req, res) => {
        try {
            const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

            if (!deletedSubject) {
                return res.status(404).json({ message: "Subject not found" });
            }
            const deletedClasses = await Class.deleteMany({ Subject: deletedSubject._id });
            const classIds = deletedClasses.map(cls => cls._id);
            await Schedule.deleteMany({ Class: { $in: classIds } });
            await Document.deleteMany({ Class: { $in: classIds } });
            const scheduleIds = await Schedule.find({ Class: { $in: classIds } }).select('_id');
            await Attendance.deleteMany({ Schedule: { $in: scheduleIds.map(sch => sch._id) } });
            res.status(200).json({ message: "Subject and related entities deleted successfully" });
        } catch (err) {
            res.status(500).json({ message: "Error deleting subject", error: err.message });
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
                return res.status(404).json({ message: "No subjects found" });
            }
            res.status(200).json(subjects);
        } catch (err) {
            res.status(500).json({ message: "Error searching for subject", error: err.message });
        }
    }
}

module.exports = subjectController;