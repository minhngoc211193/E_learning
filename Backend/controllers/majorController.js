const Major = require('../models/Major');

const majorController = {
    createMajor: async (req, res) => {
        try {
            const { Name, Description, CodeMajor } = req.body;
            const newMajor = new Major({ Name, Description, CodeMajor});
            const savedMajor = await newMajor.save();
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
            const updatedMajor = await Major.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedMajor) return res.status(404).json({ message: "Major not found" });
            res.status(200).json(updatedMajor);
        } catch (err) {
            res.status(500).json({ message: "Failed to update major", error: err.message });
        }
    },
    
    deleteMajor: async (req, res) => {
        try {
            const deletedMajor = await Major.findByIdAndDelete(req.params.id);
            if (!deletedMajor) return res.status(404).json({ message: "Major not found" });
            res.status(200).json({ message: "Major deleted successfully" });
        } catch (err) {
            res.status(500).json({ message: "Failed to delete major", error: err.message });
        }
    },

    searchMajor: async (req, res) => {
        try {
            const {search} = req.query;
            if (!search) {
                return res.status(400).json({ message: "Vui lòng nhập từ khóa" });
            }
            const majors = await Major.find({ 
                $or: [
                    { Name: { $regex: search, $options: "i" } },
                    { CodeMajor: { $regex: search, $options: "i" } }
                ]
             });
             if (majors.length === 0) {
                 return res.status(404).json({ message: "Không tìm thấy Major" });
             }

             res.status(200).json(majors);
        } catch (err) {
            res.status(500).json({ message: "Lỗi tìm Major", error: err.message });
        }
    }
};

module.exports = majorController;