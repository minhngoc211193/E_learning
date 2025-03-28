const Class = require('../models/Class');  // Import model Class
const Subject = require('../models/Subject'); // Import model Subject
const Schedule = require('../models/Schedule');
const Document = require('../models/Document');
const User = require('../models/User');
const Major = require('../models/Major');

const classController = {
    // Tạo lớp học mới
    createClass: async (req, res) => {
        try {
            const { Classname, subjectId, Teacher, Student, Slots} = req.body;

            // Kiểm tra xem Subject có tồn tại không
            const subjectExists = await Subject.findById(subjectId).populate('Major');
            if (!subjectExists) {
                return res.status(404).json({ message: "Không tìm thấy Subject" });
            }

            // Kiểm tra nếu môn học thuộc ngành của Major, thì chỉ sinh viên và giáo viên thuộc ngành đó mới được tham gia
            const subjectMajorId = subjectExists.Major._id;

            // Kiểm tra giáo viên có thuộc ngành môn học này không
            const teacher = await User.findById(Teacher).populate('Major');
            if (!teacher || !teacher.Major || teacher.Major._id.toString() !== subjectMajorId.toString()) {
                return res.status(400).json({ message: "Giáo viên phải thuộc ngành của môn học này" });
            }

            // Kiểm tra học sinh có thuộc ngành môn học này không
            for (const studentId of Student) {
                const student = await User.findById(studentId).populate('Major');
                if (!student || !student.Major || student.Major._id.toString() !== subjectMajorId.toString()) {
                    return res.status(400).json({ message: `Học sinh ${student.Fullname} không thuộc ngành của môn học này` });
                }
            }

            // Kiểm tra xem học sinh đã tham gia lớp học của môn này chưa
            for (const studentId of Student) {
                const existingClass = await Class.findOne({
                    Subject: subjectId,
                    Student: studentId
                });

                if (existingClass) {
                    return res.status(400).json({ message: `Học sinh với ID ${studentId} đã tham gia lớp học môn này` });
                }
            }

            // Tạo Class mới
            const newClass = new Class({
                Classname,
                Subject: subjectId,
                Teacher,
                Student,
                Slots
            });

            // Lưu Class vào database
            const savedClass = await newClass.save();

            // Cập nhật lại danh sách các lớp trong Subject
            subjectExists.Classes.push(savedClass._id);
            await subjectExists.save();

            // Cập nhật danh sách lớp học cho giáo viên và học sinh
            teacher.Classes.push(savedClass._id);
            await teacher.save();

            for (const studentId of Student) {
                const student = await User.findById(studentId);
                student.Classes.push(savedClass._id);
                await student.save();
            }

            res.status(201).json(savedClass);
        } catch (err) {
            res.status(500).json({ message: "Tạo lớp thất bại", error: err.message });
        }
    },

    // Lấy tất cả lớp học
    getClasses: async (req, res) => {
        try {
            const classes = await Class.find().populate({ path: "Subject", select: "Name Description", populate: { path: "Major", select: "Name" } })
                .populate({ path: "Teacher", select: "Fullname" })
                .populate({ path: "Student", select: "Fullname" });
            res.status(200).json(classes);
        } catch (err) {
            res.status(500).json({ message: "Không tải được lớp học", error: err.message });
        }
    },

    // Lấy thông tin lớp học theo ID
    getClassById: async (req, res) => {
        try {
            const classData = await Class.findById(req.params.id)
                .populate({ path: "Subject", select: "Name Description", populate: { path: "Major", select: "Name" } })
                .populate({ path: "Teacher", select: "Fullname" })
                .populate({ path: "Student", select: "Fullname" });
            // .populate("Schedules")


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
                .populate({ path: "Subject", select: "Name Description", populate: { path: "Major", select: "Name" } })
            // .populate("Teacher")
            // .populate("Student")
            // .populate("Schedules")
 
            // .populate("Documents");
            if (classes.length === 0) {
                return res.status(404).json({ message: "Không có lớp nào trong môn này" });
            }

            res.status(200).json(classes);
        } catch (err) {
            res.status(500).json({ message: "Không thể tải lớp học", error: err.message });
        }
    },

    //get class by userId
    getClassByUser: async (req, res) => {
        try {
            const userId = req.params.userId;
            const classes = await Class.find({ $or: [{ Teacher: userId }, { Student: userId }] })
                .populate({ path: "Subject", select: "Name Description", populate: { path: "Major", select: "Name" } })
                .populate({ path: "Teacher", select: "Fullname" })
                .populate({ path: "Student", select: "Fullname" });

            if (classes.length === 0) {
                return res.status(404).json({ message: "Bạn hiện không có trong lớp nào" });
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
            const classData = await Class.findByIdAndDelete(req.params.id);
    
            if (!classData) {
                return res.status(404).json({ message: "Lớp học không tồn tại" });
            }

            // Xóa tất cả các Schedules, Assignments, và Documents có liên quan đến lớp học
            await Schedule.deleteMany({ Class: classData._id });
    
            await Document.deleteMany({ Class: classData._id });

            await Subject.deleteMany({ Class: classData._id });

            await User.deleteMany({ Class: classData._id });
            // Xóa lớp học
            // await Class.findByIdAndDelete(req.params.id);
    
            res.status(200).json({ message: "Xóa lớp và các đối tượng liên quan thành công" });
        } catch (err) {
            res.status(500).json({ message: "Xóa thất bại", error: err.message });
        }
    },

    searchClass: async (req, res) => {
        try {
            const {search} = req.query;
            if(!search) {
                return res.status(400).json({message: "Vui lòng nhập từ khóa tìm kiếm"});
            }
            const classes = await Class.find({Classname: {$regex: search, $options: "i"}});
            if(classes.length === 0) {
                return res.status(404).json({message: "Không tìm thấy lớp học"});
            }
            res.status(200).json(classes);
        } catch (err) {
            res.status(500).json({ message: "Tìm kiếm lớp học thất bại", error: err.message });
    }
}
};

module.exports = classController;
