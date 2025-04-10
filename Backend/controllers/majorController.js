const Major = require('../models/Major');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Schedule = require('../models/Schedule');
const Attendance = require('../models/Attendance');
const Document = require('../models/Document');

const checkPattern = /^[A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF\u2C00-\u2C5F\u0370-\u03FF\s.]+$/;
const CodeMajorPattern = /^[A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF\u2C00-\u2C5F\u0370-\u03FF\s]+$/;

const majorController = {
    createMajor: async (req, res) => {
        try {
            const { Name, Description, CodeMajor } = req.body;
            if (Name.trim().length === 0 || Description.trim().length === 0 || CodeMajor.trim().length === 0) {
                return res.status(400).json({ message: "Name, Description and CodeMajor cannot be empty" });
            }
            if (!checkPattern.test(Name)) {
                return res.status(400).json({ message: "Name can only contain letters, numbers, and spaces and accented characters" });
            }
            if (!checkPattern.test(Description)) {
                return res.status(400).json({ message: "Description can only contain letters, numbers, and spaces and accented characters" });
            }
            if (!CodeMajorPattern.test(CodeMajor)) {
                return res.status(400).json({ message: "CodeMajor can only accept letters, numbers, spaces and accented characters" });
            }
            const existingName = await Major.findOne({ Name }).collation({ locale: 'en', strength: 2 });
            if (existingName) {
                return res.status(400).json({ message: `Major with name '${Name}' already exists` });
            }
            const existingCode = await Major.findOne({ CodeMajor }).collation({ locale: 'en', strength: 2 });
            if (existingCode) {
                return res.status(400).json({ message: `CodeMajor '${CodeMajor}' already exists` });
            }
            const newMajor = new Major({ Name, Description, CodeMajor });
            const savedMajor = await newMajor.save();

            const io = req.app.get('io');
            io.emit('newMajor', savedMajor);

            res.status(201).json(savedMajor);
        } catch (err) {
            res.status(500).json({ message: "Failed to create major", error: err.message });
        }
    },

    getAllMajors: async (req, res) => {
        try {
            const majors = await Major.find().populate("Users");
            res.status(200).json(majors);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch majors", error: err.message });
        }
    },

    getMajorById: async (req, res) => {
        try {
            const major = await Major.findById(req.params.id).populate("Users");
            if (!major) return res.status(404).json({ message: "Major not found" });
            res.status(200).json(major);
        } catch (err) {
            res.status(500).json({ message: "Failed to fetch major", error: err.message });
        }
    },

    updateMajor: async (req, res) => {
        try {
            const { Name, Description, CodeMajor } = req.body;
            const major = await Major.findById(req.params.id);
            if (Name.trim().length === 0 || Description.trim().length === 0 || CodeMajor.trim().length === 0) {
                return res.status(400).json({ message: "Name, Description and CodeMajor cannot be empty" });
            }
            if (!checkPattern.test(Name)) {
                return res.status(400).json({ message: "Name can only contain letters, numbers, and spaces and accented characters" });
            }
            if (!checkPattern.test(Description)) {
                return res.status(400).json({ message: "Description can only contain letters, numbers, and spaces and accented characters" });
            }
            if (!CodeMajorPattern.test(CodeMajor)) {
                return res.status(400).json({ message: "CodeMajor can only accept letters, numbers, spaces and accented characters" });
            }
            if (Name.toLowerCase() !== major.Name.toLowerCase()) {
                if (!checkPattern.test(Name)) {
                    return res.status(400).json({ message: "Name can only contain letters, numbers, and spaces and accented characters" });
                }
                const existingName = await Major.findOne({ Name }).collation({ locale: 'en', strength: 2 });
                if (existingName) {
                    return res.status(400).json({ message: `Major with name '${Name}' already exists` });
                }
            }
            if (CodeMajor.toLowerCase() !== major.CodeMajor.toLowerCase()) {
                if (!CodeMajorPattern.test(CodeMajor)) {
                    return res.status(400).json({ message: "CodeMajor can only accept letters, numbers, spaces and accented characters" });
                }
                const existingCode = await Major.findOne({ CodeMajor }).collation({ locale: 'en', strength: 2 });
                if (existingCode) {
                    return res.status(400).json({ message: `CodeMajor '${CodeMajor}' already exists` });
                }
            }

            const updatedMajor = await Major.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedMajor) return res.status(404).json({ message: "Major not found" });
            res.status(200).json(updatedMajor);
        } catch (err) {
            res.status(500).json({ message: "Failed to update major", error: err.message });
        }
    },

    deleteMajor: async (req, res) => {
        try {
            const majorId = req.params.id;
            const major = await Major.findById(majorId);
            if (!major) {
                return res.status(404).json({ message: "Major not found" });
            }

            const subjects = await Subject.find({ Major: majorId });
            if (subjects.length > 0) {
                const subjectIds = subjects.map(sub => sub._id);
                const classIds = await Class.find({ Subject: { $in: subjectIds } });
                const scheduleIds = await Schedule.find({ Class: { $in: classIds.map(cls => cls._id) } });
                await Class.deleteMany({ Subject: { $in: subjectIds } });
                await Schedule.deleteMany({ Class: { $in: classIds.map(cls => cls._id) } });
                await Document.deleteMany({ Class: { $in: classIds.map(cls => cls._id) } });
                await Attendance.deleteMany({ Schedule: { $in: scheduleIds.map(sch => sch._id) } });
                await Subject.deleteMany({ Major: majorId });
            }
            await Major.findByIdAndDelete(majorId);

            const io = req.app.get('io');
            io.emit('deleteMajor', majorId);

            res.status(200).json({ message: 'Major has been deleted along with related objects' });
        } catch (err) {
            res.status(500).json({ message: "Failed to delete major", error: err.message });
        }
    },

    searchMajor: async (req, res) => {
        try {
            const { search } = req.query;
            if (!search) {
                return res.status(400).json({ message: "Please enter keyword" });
            }
            const majors = await Major.find({
                $or: [
                    { Name: { $regex: search, $options: "i" } },
                    { CodeMajor: { $regex: search, $options: "i" } }
                ]
            });
            if (majors.length === 0) {
                return res.status(404).json({ message: "Major not found" });
            }

            res.status(200).json(majors);
        } catch (err) {
            res.status(500).json({ message: "Error finding Major", error: err.message });
        }
    }
};

module.exports = majorController;