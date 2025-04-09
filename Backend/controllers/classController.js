const Class = require('../models/Class');  // Import model Class
const Subject = require('../models/Subject'); // Import model Subject
const Schedule = require('../models/Schedule');
const Document = require('../models/Document');
const User = require('../models/User');
const Major = require('../models/Major');
const Attendance = require('../models/Attendance');
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
            const existingClass = await Class.findOne({ Classname }).collation({ locale: 'en', strength: 2 });
            if (existingClass) {
                return res.status(400).json({ message: `Classname '${Classname}' already exists` });
            }
            // Kiểm tra xem Subject có tồn tại không
            const subjectExists = await Subject.findById(subjectId).populate('Major');
            if (!subjectExists) {
                return res.status(404).json({ message: "Subject not found" });
            }

            // Kiểm tra nếu môn học thuộc ngành của Major, thì chỉ sinh viên và giáo viên thuộc ngành đó mới được tham gia
            const subjectMajorId = subjectExists.Major._id;

            // Kiểm tra giáo viên có thuộc ngành môn học này không
            const teacher = await User.findById(Teacher).populate('Major');
            if (!teacher || !teacher.Major || teacher.Major._id.toString() !== subjectMajorId.toString()) {
                return res.status(400).json({ message: "Teachers must be experts in this subject." });
            }

            // Kiểm tra học sinh có thuộc ngành môn học này không
            for (const studentId of Student) {
                const student = await User.findById(studentId).populate('Major');
                if (!student || !student.Major || student.Major._id.toString() !== subjectMajorId.toString()) {
                    return res.status(400).json({ message: `Student ${student.Fullname} not related to this subject` });
                }
            }

            // Kiểm tra xem học sinh đã tham gia lớp học của môn này chưa
            for (const studentId of Student) {
                const existingClass = await Class.findOne({
                    Subject: subjectId,
                    Student: studentId
                });

                if (existingClass) {
                    return res.status(400).json({ message: `Student with ID ${studentId} have taken this course` });
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

            const io = req.app.get('io');
            io.emit('newClass', savedClass);

            // ===== Gửi email cho giáo viên =====
            const teacherInfo = await User.findById(Teacher);
            if (teacherInfo) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: teacherInfo.Email, // Email của teacher
                    subject: "Notice: You have just been assigned to teach a new class.",
                    text: `Hi, ${teacherInfo.Fullname},\n\n` +
                        `You have just been assigned to teach the class: ${Classname}.\n` +
                        `Please check the system for more details.\n\n` +
                        `Best regards,`
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
                        subject: "Notice: You have just been added to a new class.",
                        text: `Hi ${studentInfo.Fullname},\n\n` +
                            `You have just been added to the class: ${Classname}.\n` +
                            `Please check the system for more details.\n\n` +
                            `Best regards,`
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
            res.status(500).json({ message: "Create failed class", error: err.message });
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
            res.status(500).json({ message: "Unable to load class", error: err.message });
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


            if (!classData) return res.status(404).json({ message: "Class not found" });

            res.status(200).json(classData);
        } catch (err) {
            res.status(500).json({ message: "Unable to load class", error: err.message });
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
                return res.status(404).json({ message: "There are no classes in this subject." });
            }

            res.status(200).json(classes);
        } catch (err) {
            res.status(500).json({ message: "Unable to load class", error: err.message });
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
                return res.status(404).json({ message: "You are not in any classes at the moment." });
            }
            res.status(200).json(classes);
        } catch (err) {
            res.status(500).json({ message: "Unable to load class", error: err.message });
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


            // Tìm lớp học cần cập nhật
            const updatedClass = await Class.findById(classId).populate("Teacher").populate("Student");
            if (!updatedClass) {
                return res.status(404).json({ message: "No class found" });
            }
            if (Classname && Classname.toLowerCase() !== updatedClass.Classname.toLowerCase()) {
                // Kiểm tra Classname có hợp lệ không
                if (!Classname || Classname.trim().length === 0) {
                    return res.status(400).json({ message: "Classname is required" });
                }

                // Validate Classname format (optional, example: alphanumeric with space support)
                const classNamePattern = /^[A-Za-z0-9\u00C0-\u00FF\s]+$/;  // Adjust the regex as needed
                if (!classNamePattern.test(Classname)) {
                    return res.status(400).json({ message: "Classname format is invalid" });
                }

                // Check if Classname already exists (unique constraint check)
                const existingClass = await Class.findOne({ Classname }).collation({ locale: 'en', strength: 2 });
                if (existingClass) {
                    return res.status(400).json({ message: `Classname '${Classname}' already exists` });
                }
            }

            // Lưu lại thông tin trước khi cập nhật
            const oldTeacherId = updatedClass.Teacher?._id.toString() || null;
            const oldStudentIds = updatedClass.Student.map(s => s._id.toString());

            // Kiểm tra Subject
            const subjectExists = await Subject.findById(subjectId).populate('Major');
            if (!subjectExists) {
                return res.status(404).json({ message: "Subject not found" });
            }

            // Kiểm tra giáo viên hợp lệ
            const teacher = await User.findById(Teacher).populate('Major');
            if (!teacher || !teacher.Major || teacher.Major._id.toString() !== subjectExists.Major._id.toString()) {
                return res.status(400).json({ message: "Teachers must be experts in this subject." });
            }

            // Kiểm tra học sinh hợp lệ
            for (const studentId of Student) {
                const student = await User.findById(studentId).populate('Major');
                if (!student || !student.Major || student.Major._id.toString() !== subjectExists.Major._id.toString()) {
                    return res.status(400).json({ message: `Students ${student.Fullname} not in the major of this subject` });
                }
            }

            // Xác định học sinh mới
            const newStudents = Student.filter(studentId => !oldStudentIds.includes(studentId));
            for (const studentId of newStudents) {
                const existingClass = await Class.findOne({ Subject: subjectExists._id, Student: studentId });
                if (existingClass) {
                    return res.status(400).json({ message: `Students with ID ${studentId} have taken this course` });
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
                        subject: "Notice: You have just been assigned to a new class.",
                        text: `Hi ${newTeacher.Fullname},\n\n
                        You have just been assigned to teach the class: ${savedClass.Classname}.\n
                        Please check the system.`
                    });
                }
                if (oldTeacherId) {
                    const oldTeacher = await User.findById(oldTeacherId);
                    if (oldTeacher) {
                        await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: oldTeacher.Email,
                            subject: "Note: You have just been removed from the class.",
                            text: `Hi ${oldTeacher.Fullname},\n\n
                            You have just been removed from the class: ${savedClass.Classname}.`
                        });
                    }
                }
                const attendances = await Attendance.find({ Schedule: { $in: savedClass.Schedules } }); // Tìm các Attendance liên quan đến các Schedule của lớp học
                if (attendances.length > 0) {
                    const updateAttendancePromises = attendances.map(async (attendance) => {
                        attendance.Teacher = Teacher;  // Cập nhật giáo viên trong Attendance
                        await attendance.save();  // Lưu lại các thay đổi
                    });

                    await Promise.all(updateAttendancePromises);
                }

            }

            // Kiểm tra thay đổi học sinh
            const newStudentIds = savedClass.Student.map(s => s._id.toString());
            const addedStudentIds = newStudentIds.filter(id => !oldStudentIds.includes(id));
            const removedStudentIds = oldStudentIds.filter(id => !newStudentIds.includes(id));
            console.log(addedStudentIds);
            if (removedStudentIds.length > 0) {
                // Xóa tất cả Attendance của học sinh bị xóa khỏi lớp

                // Bước 2: Tìm các Attendance mà học sinh bị xóa tham gia
                const removedAttendances = await Attendance.find({
                    Student: { $in: removedStudentIds }
                });

                // Lấy ra các ID của Attendance đã bị xóa
                const removedAttendanceIds = removedAttendances.map(attendance => attendance._id);

                // Bước 3: Cập nhật lại các Schedule để loại bỏ Attendance của học sinh bị xóa
                await Schedule.updateMany(
                    { 'Attendances': { $in: removedAttendanceIds } },  // Tìm các Schedule có Attendance chứa ID của học sinh bị xóa
                    { $pull: { 'Attendances': { $in: removedAttendanceIds } } }  // Loại bỏ Attendance của học sinh khỏi Attendances của Schedule
                );
                await Attendance.deleteMany({ Student: { $in: removedStudentIds } });

            }
            for (const addedId of addedStudentIds) {
                const addedStudent = await User.findById(addedId);
                if (addedStudent) {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: addedStudent.Email,
                        subject: "Notice: You have just been added to the class.",
                        text: `Hi ${addedStudent.Fullname},\n\n
                        You have just been added to the class: ${savedClass.Classname}.`
                    });
                }
            }

            for (const removedId of removedStudentIds) {
                const removedStudent = await User.findById(removedId);
                if (removedStudent) {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: removedStudent.Email,
                        subject: "Notice: You have just been removed from the class.",
                        text: `Hi ${removedStudent.Fullname},\n\n
                        You have just been removed from the class: ${savedClass.Classname}.`
                    });
                }
            }

            for (const studentId of newStudents) {
                await addAttendanceForNewStudent(savedClass._id, studentId); // Gọi hàm tạo điểm danh cho học sinh mới
            }

            res.status(200).json(savedClass);

        } catch (err) {
            res.status(500).json({ message: "Class update failed", error: err.message });
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

            const io = req.app.get('io');
            io.emit('deleteClass', req.params.id);


            res.status(200).json({ message: "Delete layer and related objects successfully" });
        } catch (err) {
            res.status(500).json({ message: "Delete failure", error: err.message });
        }
    },

    searchClass: async (req, res) => {
        try {
            const { search } = req.query;
            if (!search) {
                return res.status(400).json({ message: "Please enter search keyword" });
            }
            const classes = await Class.find({ Classname: { $regex: search, $options: "i" } });
            if (classes.length === 0) {
                return res.status(404).json({ message: "No class found" });
            }
            res.status(200).json(classes);
        } catch (err) {
            res.status(500).json({ message: "Search for failed classes", error: err.message });
        }
    }
};

module.exports = classController;
