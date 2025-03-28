const Schedule = require('../models/Schedule');
const Class = require('../models/Class');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const scheduleController = {
    createSchedule: async (req, res) => {
        try {
            const { Address, Slot, ClassId, Day } = req.body;

            // Chuyển 'Day' thành Date object
            const day = new Date(Day);
            const startOfDay = new Date(day.setHours(0, 0, 0, 0));  // 00:00:00
            const endOfDay = new Date(day.setHours(23, 59, 59, 999));  // 23:59:59
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00

            if (day < today) {
                return res.status(400).json({ message: "Không thể tạo lịch học với ngày trong quá khứ." });
            }

            // Kiểm tra xem lớp học có tồn tại không
            const classData = await Class.findById(ClassId);
            if (!classData) {
                return res.status(404).json({ message: "Không tìm thấy lớp học" });
            }

            // Kiểm tra xem lớp học còn Slots không
            if (classData.Slots <= 0) {
                return res.status(400).json({ message: "Lớp học này đã hết Slot" });
            }

            const existingClass = await Schedule.findOne({
                Class: ClassId,
                Slot,             // Kiểm tra trùng Slot
                Day: { $gte: startOfDay, $lt: endOfDay },  // Kiểm tra trùng ngày
            }).populate('Class');

            if (existingClass) {
                return res.status(400).json({
                    message: `Lớp ${existingClass.Class.Classname} đã có lịch học vào ${Slot} vào ngày ${day.toLocaleDateString()}.`
                });
            }

            // Kiểm tra xem có lịch học nào trùng không (cùng class, phòng, slot, ngày)
            const existingSchedule = await Schedule.findOne({
                Slot,             // Kiểm tra trùng Slot
                Day: { $gte: startOfDay, $lt: endOfDay },  // Kiểm tra trùng ngày
                Address,          // Kiểm tra trùng phòng học
            }).populate('Class');

            if (existingSchedule) {
                return res.status(400).json({
                    message: `Đã có lịch học tại ${Address} vào ${Slot} vào ngày ${day.toLocaleDateString()} cho lớp học: ${existingSchedule.Class.Classname}`
                });
            }

            // Tạo lịch học mới
            const newSchedule = new Schedule({
                Class: ClassId,
                Address,
                Slot,
                Day: new Date(Day)  // Lưu trữ Day dưới dạng Date object
            });

            // Lưu lịch học vào database
            const savedSchedule = await newSchedule.save();

            // Lấy danh sách học sinh trong lớp để tạo attendance cho mỗi học sinh
            
            // Cập nhật lại Slots của lớp
            classData.Slots -= 1;  // Trừ đi 1 Slot
            await classData.save();


            const students = classData.Student;  // Lấy danh sách sinh viên trong lớp
            const teacher = classData.Teacher;  // Lấy giáo viên của lớp

            const attendancePromises = students.map(async (student) => {
                const attendanceExists = await Attendance.findOne({
                    Schedule: savedSchedule._id,
                    Student: student,
                });
    
                // Nếu chưa có Attendance cho học sinh này, tạo mới
                if (!attendanceExists) {
                    await Attendance.create({
                        Schedule: savedSchedule._id,
                        Teacher: teacher,
                        Student: student,
                        IsPresent: 'pending', // Mặc định là pending
                        Date: savedSchedule.Day
                    });
                }
            });

            await Promise.all(attendancePromises);

            // ============== THÊM PHẦN GỬI MAIL ==============
            const teacher = await User.findById(classData.Teacher);
            const students = await User.find({ _id: { $in: classData.Student } });

            // Định dạng ngày để gửi mail (VD: 24/03/2025)
            const formattedDate = new Date(Day).toLocaleDateString();

            // 1) Gửi email cho giáo viên
            if (teacher) {
                const mailOptionsTeacher = {
                    from: process.env.EMAIL_USER,
                    to: teacher.Email,
                    subject: "Lịch học mới được tạo",
                    text: `Xin chào thầy/cô ${teacher.Fullname},

Lịch học mới đã được tạo cho lớp: ${classData.Classname}.
- Phòng học: ${Address}
- Slot: ${Slot}
- Ngày: ${formattedDate}

Vui lòng kiểm tra lại hệ thống để theo dõi chi tiết.

Trân trọng,
Ban Quản trị`
                };
                await transporter.sendMail(mailOptionsTeacher);
            }

            // 2) Gửi email cho từng sinh viên trong lớp
            for (const stu of students) {
                const mailOptionsStudent = {
                    from: process.env.EMAIL_USER,
                    to: stu.Email,
                    subject: "Lịch học mới được tạo",
                    text: `Xin chào ${stu.Fullname}, Bạn có lịch học mới cho lớp: ${classData.Classname}.
- Phòng học: ${Address}
- Slot: ${Slot}
- Ngày: ${formattedDate}

Vui lòng kiểm tra lại hệ thống để theo dõi chi tiết.

Trân trọng,
Ban Quản trị`
                };
                await transporter.sendMail(mailOptionsStudent);
            }

            res.status(201).json(savedSchedule);
        } catch (err) {
            res.status(500).json({ message: "Tạo lịch học thất bại", error: err.message });
        }
    },

    updateSchedule: async (req, res) => {
        try {
            const { Address, Slot, Day, ClassId } = req.body;

            // Chuyển 'Day' thành Date object
            const day = new Date(Day);
            const startOfDay = new Date(day.setHours(0, 0, 0, 0));  // 00:00:00
            const endOfDay = new Date(day.setHours(23, 59, 59, 999));  // 23:59:59
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00

            if (day < today) {
                return res.status(400).json({ message: "Không thể tạo lịch học với ngày trong quá khứ." });
            }

            const classData = await Class.findById(ClassId);
            if (!classData) {
                return res.status(404).json({ message: "Không tìm thấy lớp học" });
            }

            const existingClass = await Schedule.findOne({
                Class: ClassId,
                Slot,             // Kiểm tra trùng Slot
                Day: { $gte: startOfDay, $lt: endOfDay },  // Kiểm tra trùng ngày
                _id: { $ne: req.params.id }  // Đảm bảo rằng không so sánh với chính lịch đang được cập nhật
            }).populate('Class');

            if (existingClass) {
                return res.status(400).json({
                    message: `Lớp ${existingClass.Class.Classname} đã có lịch học vào ${Slot} vào ngày ${day.toLocaleDateString()}.`
                });
            }

            // Kiểm tra xem lịch học có trùng phòng và slot vào cùng ngày không
            const existingSchedule = await Schedule.findOne({
                Address,
                Slot,
                Day: { $gte: startOfDay, $lt: endOfDay },  // Kiểm tra trùng ngày
                _id: { $ne: req.params.id }  // Đảm bảo rằng không so sánh với chính lịch đang được cập nhật
            }).populate('Class');

            if (existingSchedule) {
                return res.status(400).json({ message: `Đã có lịch học tại ${Address} vào ${Slot} vào ngày ${day.toLocaleDateString()} cho lớp học: ${existingSchedule.Class.Classname}` });
            }

            // Cập nhật lịch học
            const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });

            if (!updatedSchedule) {
                return res.status(404).json({ message: "Không tìm thấy lịch học" });
            }

            // ============== THÊM PHẦN GỬI MAIL ==============
            // Tương tự như createSchedule, gửi thông báo cho giáo viên & sinh viên
            const teacher = await User.findById(classData.Teacher);
            const students = await User.find({ _id: { $in: classData.Student }});
            const formattedDate = new Date(Day).toLocaleDateString();

            // 1) Gửi email cho giáo viên
            if (teacher) {
                const mailOptionsTeacher = {
                    from: process.env.EMAIL_USER,
                    to: teacher.Email,
                    subject: "Lịch học đã được cập nhật",
                    text: `Xin chào thầy/cô ${teacher.Fullname},

Lịch học của lớp: ${classData.Classname} đã được cập nhật.
- Phòng học: ${Address}
- Slot: ${Slot}
- Ngày: ${formattedDate}

Vui lòng kiểm tra lại hệ thống để theo dõi chi tiết.

Trân trọng,
Ban Quản trị`
                };
                await transporter.sendMail(mailOptionsTeacher);
            }

            // 2) Gửi email cho từng sinh viên
            for (const stu of students) {
                const mailOptionsStudent = {
                    from: process.env.EMAIL_USER,
                    to: stu.Email,
                    subject: "Lịch học đã được cập nhật",
                    text: `Xin chào ${stu.Fullname},

Lịch học của lớp: ${classData.Classname} đã được cập nhật.
- Phòng học: ${Address}
- Slot: ${Slot}
- Ngày: ${formattedDate}

Vui lòng kiểm tra lại hệ thống để theo dõi chi tiết.

Trân trọng,
Ban Quản trị`
                };
                await transporter.sendMail(mailOptionsStudent);
            }

            res.status(200).json(updatedSchedule);
        } catch (err) {
            res.status(500).json({ message: "Cập nhật lịch học thất bại", error: err.message });
        }
    },


    getScheduleByUserId: async (req, res) => {
        try {
            const userId = req.user.id;  // Lấy thông tin người dùng từ token
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            let classes;

            if (user.Role === 'teacher') {
                // Nếu là giáo viên, lấy tất cả lịch học của các lớp mà giáo viên giảng dạy
                classes = await Class.find({ Teacher: userId });
            } else if (user.Role === 'student') {
                // Nếu là học sinh, lấy tất cả lịch học của các lớp mà học sinh tham gia
                classes = await Class.find({ Student: userId });
            } else {
                return res.status(403).json({ message: 'Quyền truy cập không hợp lệ' });
            }

            if (!classes || classes.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy lớp học cho người dùng này' });
            }

            // Lấy tất cả các lịch học của các lớp mà người dùng tham gia hoặc giảng dạy
            const schedules = await Schedule.find({ Class: { $in: classes.map(classItem => classItem._id) } })
                .populate({
                    path: 'Class', select: 'Classname',
                    populate: [
                        { path: 'Subject', select: 'Name' },  // Lấy tên môn học
                        { path: 'Teacher', select: 'Fullname' }  // Lấy tên giáo viên
                    ]
                });

            if (schedules.length === 0) {
                return res.status(404).json({ message: 'Không có lịch học cho các lớp này' });
            }

            // Trả về lịch học
            res.status(200).json({ schedules });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi khi lấy lịch học', error: error.message });
        }
    },


    deleteSchedule: async (req, res) => {
        try {
            const schedule = await Schedule.findByIdAndDelete(req.params.id);
            if (!schedule) {
                return res.status(404).json({ message: "Lịch học không tồn tại" });
            }

            // Cập nhật Slots cho lớp học (tăng lên khi xóa lịch học)
            const classData = await Class.findById(schedule.Class);
            if (classData) {
                classData.Slots += 1;
                await classData.save();

                // ============== THÊM PHẦN GỬI MAIL ==============
                // Lấy giáo viên & sinh viên
                const teacher = await User.findById(classData.Teacher);
                const students = await User.find({ _id: { $in: classData.Student }});
                // Biến schedule.Day là Date object, format lại
                const formattedDate = schedule.Day.toLocaleDateString();

                // 1) Gửi email cho giáo viên
                if (teacher) {
                    const mailOptionsTeacher = {
                        from: process.env.EMAIL_USER,
                        to: teacher.Email,
                        subject: "Lịch học đã bị xóa",
                        text: `Xin chào thầy/cô ${teacher.Fullname},

Lịch học của lớp: ${classData.Classname} vào ngày ${formattedDate} (Slot ${schedule.Slot}, Phòng ${schedule.Address}) đã bị xóa.

Vui lòng kiểm tra lại hệ thống để theo dõi chi tiết.

Trân trọng,
Ban Quản trị`
                    };
                    await transporter.sendMail(mailOptionsTeacher);
                }

                // 2) Gửi email cho từng sinh viên
                for (const stu of students) {
                    const mailOptionsStudent = {
                        from: process.env.EMAIL_USER,
                        to: stu.Email,
                        subject: "Lịch học đã bị xóa",
                        text: `Xin chào ${stu.Fullname},

Lịch học của lớp: ${classData.Classname} vào ngày ${formattedDate} (Slot ${schedule.Slot}, Phòng ${schedule.Address}) đã bị xóa.

Vui lòng kiểm tra lại hệ thống nếu có thắc mắc.

Trân trọng,
Ban Quản trị`
                    };
                    await transporter.sendMail(mailOptionsStudent);
                }
                // ============== KẾT THÚC PHẦN GỬI MAIL ==============
            }

            res.status(200).json({ message: "Xóa lịch học thành công" });
        } catch (err) {
            res.status(500).json({ message: "Xóa lịch học thất bại", error: err.message });
        }
    },

    getScheduleByDay: async (req, res) => {
        try {
            const { day } = req.query;
            if (!day) {
                return res.status(400).json({ message: "Vui lòng cung cấp ngày" });
            }

            // Chuyển đổi `day` thành đầu và cuối ngày để tìm kiếm
            const date = new Date(day);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            // Tìm lịch học trong khoảng thời gian của ngày
            const schedules = await Schedule.find({
                Day: { $gte: startOfDay, $lt: endOfDay }
            })
                .populate({
                    path: 'Class', select: 'Classname',
                    populate: [
                        { path: 'Subject', select: 'Name' },  // Lấy tên môn học
                        { path: 'Teacher', select: 'Fullname' }  // Lấy tên giáo viên
                    ]
                });

            if (!schedules.length) {
                return res.status(404).json({ message: "Không có lịch học nào trong ngày này" });
            }

            res.status(200).json(schedules);
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy lịch học theo ngày", error: error.message });
        }
    },

    getScheduleById: async (req, res) => {
        try {
            const schedule = await Schedule.findById(req.params.id)
                .populate({
                    path: "Class", select: "Classname",
                    populate: { path: "Subject", select: "Name" },
                    populate: { path: "Teacher", select: "Fullname" }
                });
            if (!schedule) {
                return res.status(404).json({ message: "Không tìm thấy lịch học" });
            }
            res.status(200).json(schedule);
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy chi tiết lịch học", error: error.message });
        }
    }
}

module.exports = scheduleController;