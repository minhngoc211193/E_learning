const Class = require('../models/Class');  // Import model Class
const Subject = require('../models/Subject'); // Import model Subject
const Schedule = require('../models/Schedule');
const Document = require('../models/Document');
const User = require('../models/User');
const Major = require('../models/Major');
const { addAttendanceForNewStudent } = require('./attendanceController');

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Email của bạn
        pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng
    }
});

const classController = {
    // Tạo lớp học mới
    createClass: async (req, res) => {
        try {
            const { Classname, subjectId, Teacher, Student, Slots } = req.body;

            if (!Classname || Classname.trim().length === 0) {
                return res.status(400).json({ message: "Classname is required" });
            }
    
            // Validate Classname format (optional, example: alphanumeric with space support)
            const classNamePattern = /^[A-Za-z0-9\u00C0-\u00FF\s]+$/;  // Adjust the regex as needed
            if (!classNamePattern.test(Classname)) {
                return res.status(400).json({ message: "Classname format is invalid" });
            }
    
            // Check if Classname already exists (unique constraint check)
            const existingClass = await Class.findOne({ Classname });
            if (existingClass) {
                return res.status(400).json({ message: `Classname '${Classname}' already exists` });
            }
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

            // ===== Gửi email cho giáo viên =====
            const teacherInfo = await User.findById(Teacher);
            if (teacherInfo) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: teacherInfo.Email, // Email của teacher
                    subject: "Thông báo: Bạn vừa được phân công giảng dạy lớp mới",
                    text: `Xin chào ${teacherInfo.Fullname},\n\n` +
                        `Bạn vừa được phân công giảng dạy lớp: ${Classname}.\n` +
                        `Vui lòng kiểm tra hệ thống để biết thêm chi tiết.\n\n` +
                        `Trân trọng,`
                };
                await transporter.sendMail(mailOptions);
            }

            // ===== Gửi email cho từng học sinh =====
            for (const studentId of Student) {
                const studentInfo = await User.findById(studentId);
                if (studentInfo) {
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: studentInfo.Email,
                        subject: "Thông báo: Bạn vừa được thêm vào lớp mới",
                        text: `Xin chào ${studentInfo.Fullname},\n\n` +
                            `Bạn vừa được thêm vào lớp: ${Classname}.\n` +
                            `Vui lòng kiểm tra hệ thống để biết thêm chi tiết.\n\n` +
                            `Trân trọng,`
                    };
                    await transporter.sendMail(mailOptions);
                }
            }

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

    updateClass: async (req, res) => {
        try {
            const { Classname, subjectId, Teacher, Student, Slots } = req.body;
            const classId = req.params.id; // ID lớp cần cập nhật

            if (!Classname || Classname.trim().length === 0) {
                return res.status(400).json({ message: "Classname is required" });
            }
    
            // Validate Classname format (optional, example: alphanumeric with space support)
            const classNamePattern = /^[A-Za-z0-9\u00C0-\u00FF\s]+$/;  // Adjust the regex as needed
            if (!classNamePattern.test(Classname)) {
                return res.status(400).json({ message: "Classname format is invalid" });
            }
    
            // Check if Classname already exists (unique constraint check)
            const existingClass = await Class.findOne({ Classname });
            if (existingClass) {
                return res.status(400).json({ message: `Classname '${Classname}' already exists` });
            }

            // Tìm lớp học cần cập nhật
            const updatedClass = await Class.findById(classId).populate("Teacher").populate("Student");
            if (!updatedClass) {
                return res.status(404).json({ message: "Không tìm thấy lớp học" });
            }

            // Lưu lại thông tin trước khi cập nhật
            const oldTeacherId = updatedClass.Teacher?._id.toString() || null;
            const oldStudentIds = updatedClass.Student.map(s => s._id.toString());

            // Kiểm tra Subject
            const subjectExists = await Subject.findById(subjectId).populate('Major');
            if (!subjectExists) {
                return res.status(404).json({ message: "Không tìm thấy Subject" });
            }

            // Kiểm tra giáo viên hợp lệ
            const teacher = await User.findById(Teacher).populate('Major');
            if (!teacher || !teacher.Major || teacher.Major._id.toString() !== subjectExists.Major._id.toString()) {
                return res.status(400).json({ message: "Giáo viên phải thuộc ngành của môn học này" });
            }

            // Kiểm tra học sinh hợp lệ
            for (const studentId of Student) {
                const student = await User.findById(studentId).populate('Major');
                if (!student || !student.Major || student.Major._id.toString() !== subjectExists.Major._id.toString()) {
                    return res.status(400).json({ message: `Học sinh ${student.Fullname} không thuộc ngành của môn học này` });
                }
            }

            // Xác định học sinh mới
            const newStudents = Student.filter(studentId => !oldStudentIds.includes(studentId));
            for (const studentId of newStudents) {
                const existingClass = await Class.findOne({ Subject: subjectExists._id, Student: studentId });
                if (existingClass) {
                    return res.status(400).json({ message: `Học sinh với ID ${studentId} đã tham gia lớp học môn này` });
                }
            }

            // Cập nhật lớp học
            updatedClass.Classname = Classname;
            updatedClass.Subject = subjectId;
            updatedClass.Teacher = Teacher;
            updatedClass.Student = Student;
            updatedClass.Slots = Slots;
            const savedClass = await updatedClass.save();

            // Kiểm tra thay đổi giáo viên
            const newTeacherId = savedClass.Teacher?._id.toString() || null;
            if (newTeacherId !== oldTeacherId) {
                if (newTeacherId) {
                    const newTeacher = await User.findById(newTeacherId);
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: newTeacher.Email,
                        subject: "Thông báo: Bạn vừa được phân công vào lớp mới",
                        text: `Xin chào ${newTeacher.Fullname},\n\nBạn vừa được phân công giảng dạy lớp: ${savedClass.Classname}.\nVui lòng kiểm tra hệ thống.`
                    });
                }
                if (oldTeacherId) {
                    const oldTeacher = await User.findById(oldTeacherId);
                    if (oldTeacher) {
                        await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: oldTeacher.Email,
                            subject: "Thông báo: Bạn vừa bị gỡ khỏi lớp",
                            text: `Xin chào ${oldTeacher.Fullname},\n\nBạn vừa bị gỡ khỏi lớp: ${savedClass.Classname}.`
                        });
                    }
                }
            }

            // Kiểm tra thay đổi học sinh
            const newStudentIds = savedClass.Student.map(s => s._id.toString());
            const addedStudentIds = newStudentIds.filter(id => !oldStudentIds.includes(id));
            const removedStudentIds = oldStudentIds.filter(id => !newStudentIds.includes(id));

            for (const addedId of addedStudentIds) {
                const addedStudent = await User.findById(addedId);
                if (addedStudent) {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: addedStudent.Email,
                        subject: "Thông báo: Bạn vừa được thêm vào lớp",
                        text: `Xin chào ${addedStudent.Fullname},\n\nBạn vừa được thêm vào lớp: ${savedClass.Classname}.`
                    });
                }
            }

            for (const removedId of removedStudentIds) {
                const removedStudent = await User.findById(removedId);
                if (removedStudent) {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: removedStudent.Email,
                        subject: "Thông báo: Bạn vừa bị gỡ khỏi lớp",
                        text: `Xin chào ${removedStudent.Fullname},\n\nBạn vừa bị gỡ khỏi lớp: ${savedClass.Classname}.`
                    });
                }
            }

            for (const studentId of newStudents) {
                await addAttendanceForNewStudent(savedClass._id, studentId); // Gọi hàm tạo điểm danh cho học sinh mới
            }

            res.status(200).json(savedClass);

        } catch (err) {
            res.status(500).json({ message: "Cập nhật lớp thất bại", error: err.message });
        }
    },


    // Xóa lớp học theo ID
    deleteClass: async (req, res) => {
        try {
            const classData = await Class.findByIdAndDelete(req.params.id);

            await Promise.all([
                Schedule.deleteMany({ Class: classData._id }),
                Document.deleteMany({ Class: classData._id })
            ]);

            // Cập nhật lại các sinh viên và giáo viên trong lớp học (xóa lớp khỏi danh sách lớp của người dùng)
            await User.updateMany(
                { Classes: classData._id },
                { $pull: { Classes: classData._id } }
            );

            // Kiểm tra và xóa môn học nếu không còn lớp học nào liên quan
            const subject = await Subject.findById(classData.Subject);
            if (subject && subject.Classes.length === 1) {
                await Subject.findByIdAndDelete(classData.Subject);
            }

            // Xóa lớp học
            await classData.remove();

            res.status(200).json({ message: "Xóa lớp và các đối tượng liên quan thành công" });
        } catch (err) {
            res.status(500).json({ message: "Xóa thất bại", error: err.message });
        }
    },

    searchClass: async (req, res) => {
        try {
            const { search } = req.query;
            if (!search) {
                return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
            }
            const classes = await Class.find({ Classname: { $regex: search, $options: "i" } });
            if (classes.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy lớp học" });
            }
            res.status(200).json(classes);
        } catch (err) {
            res.status(500).json({ message: "Tìm kiếm lớp học thất bại", error: err.message });
        }
    }
};

module.exports = classController;
