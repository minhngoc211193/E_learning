const Schedule = require('../models/Schedule');
const Class = require('../models/Class');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const Attendance = require('../models/Attendance');
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
            const day = new Date(Day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (day < today ||day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear()) {
                return res.status(400).json({ message: "Cannot create a schedule for a past date" });
            }
            const startOfDay = new Date(day.setHours(0, 0, 0, 0));
            const endOfDay = new Date(day.setHours(23, 59, 59, 999));
            const classData = await Class.findById(ClassId);
            if (!classData) {
                return res.status(404).json({ message: "Class not found" });
            }
            if (classData.Slots <= 0) {
                return res.status(400).json({ message: "This class has no available slots" });
            }

            const existingClass = await Schedule.findOne({
                Class: ClassId,
                Slot,
                Day: { $gte: startOfDay, $lt: endOfDay },
            }).populate('Class');
            if (existingClass) {
                return res.status(400).json({
                    message: `The class ${existingClass.Class.Classname} already has a schedule on ${day.toLocaleDateString()} at ${Slot}`
                });
            }

            const existingSchedule = await Schedule.findOne({
                Slot,
                Day: { $gte: startOfDay, $lt: endOfDay },
                Address,
            }).populate('Class');
            if (existingSchedule) {
                return res.status(400).json({
                    message: `There is already a class scheduled at ${Address} on ${day.toLocaleDateString()} at ${Slot} for class: ${existingSchedule.Class.Classname}`
                });
            }

            const newSchedule = new Schedule({
                Class: ClassId,
                Address,
                Slot,
                Day: new Date(Day)
            });
            const savedSchedule = await newSchedule.save();
            classData.Slots -= 1;
            await classData.save();
            const students = await User.find({ _id: { $in: classData.Student } });
            const teacher = await User.findById(classData.Teacher);
            const attendancePromises = students.map(async (student) => {
                const attendanceExists = await Attendance.findOne({
                    Schedule: savedSchedule._id,
                    Student: student,
                });
                if (!attendanceExists) {
                    const attendance = await Attendance.create({
                        Schedule: savedSchedule._id,
                        Teacher: teacher,
                        Student: student,
                        IsPresent: 'pending',
                        Date: savedSchedule.Day
                    });
                    savedSchedule.Attendances.push(attendance._id);
                }
            });

            await Promise.all(attendancePromises);
            await savedSchedule.save();

            // ============== THÊM PHẦN GỬI MAIL ==============

            // Định dạng ngày để gửi mail (VD: 24/03/2025)
            const formattedDate = new Date(Day).toLocaleDateString();

            // 1) Gửi email cho giáo viên
            if (teacher) {
                const mailOptionsTeacher = {
                    from: process.env.EMAIL_USER,
                    to: teacher.Email,
                    subject: "New class schedule created",
                    text: `Hello teacher ${teacher.Fullname},

A new schedule has been created for the class: ${classData.Classname}.
- Classroom: ${Address}
- Slot: ${Slot}
- Day: ${formattedDate}

Please check back to the system for details.

Sincerely,
Administration`
                };
                await transporter.sendMail(mailOptionsTeacher);
            }

            // 2) Gửi email cho từng sinh viên trong lớp
            for (const stu of students) {
                const mailOptionsStudent = {
                    from: process.env.EMAIL_USER,
                    to: stu.Email,
                    subject: "New class schedule created",
                    text: `Hi ${stu.Fullname}, 
                    You have a new schedule for class: ${classData.Classname}.
- Classroom: ${Address}
- Slot: ${Slot}
- Day: ${formattedDate}

Please check back to the system for details.

Sincerely,
Administration`
                };
                await transporter.sendMail(mailOptionsStudent);
            }

            res.status(201).json(savedSchedule);
        } catch (err) {
            res.status(500).json({ message: "Failed to create the schedule", error: err.message });
        }
    },

    updateSchedule: async (req, res) => {
        try {
            const { Address, Slot, Day, ClassId } = req.body;
            const day = new Date(Day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (day < today  ||day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear()) {
                return res.status(400).json({ message: "Cannot update a schedule to a past date" });
            }
            const startOfDay = new Date(day.setHours(0, 0, 0, 0));
            const endOfDay = new Date(day.setHours(23, 59, 59, 999));
            const classData = await Class.findById(ClassId);
            if (!classData) {
                return res.status(404).json({ message: "Class not found" });
            }

            const existingClass = await Schedule.findOne({
                Class: ClassId,
                Slot,
                Day: { $gte: startOfDay, $lt: endOfDay },
                _id: { $ne: req.params.id }
            }).populate('Class');

            if (existingClass) {
                return res.status(400).json({
                    message: `The class ${existingClass.Class.Classname} already has a schedule on ${day.toLocaleDateString()} at ${Slot}`
                });
            }

            const existingSchedule = await Schedule.findOne({
                Address,
                Slot,
                Day: { $gte: startOfDay, $lt: endOfDay },
                _id: { $ne: req.params.id }
            }).populate('Class');

            if (existingSchedule) {
                return res.status(400).json({
                    message: `There is already a class scheduled at ${Address} on ${day.toLocaleDateString()} at ${Slot} for class: ${existingSchedule.Class.Classname}`
                });
            }

            const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedSchedule) {
                return res.status(404).json({ message: "Schedule not found" });
            }

            const attendances = await Attendance.find({ Schedule: updatedSchedule._id });
            if (attendances.length > 0) {
                const updateAttendancePromises = attendances.map(async (attendance) => {
                    attendance.Date = new Date(Day);
                    await attendance.save();
                });
                await Promise.all(updateAttendancePromises);
            }

            // ============== THÊM PHẦN GỬI MAIL ==============
            // Tương tự như createSchedule, gửi thông báo cho giáo viên & sinh viên
            const teacher = await User.findById(classData.Teacher);
            const students = await User.find({ _id: { $in: classData.Student } });
            const formattedDate = new Date(Day).toLocaleDateString();

            // 1) Gửi email cho giáo viên
            if (teacher) {
                const mailOptionsTeacher = {
                    from: process.env.EMAIL_USER,
                    to: teacher.Email,
                    subject: "The schedule has been updated.",
                    text: `Hello teacher ${teacher.Fullname},

Class schedule: ${classData.Classname} has been updated.
- Classroom: ${Address}
- Slot: ${Slot}
- Day: ${formattedDate}

Please check back to the system for details.

Sincerely,
Administration`
                };
                await transporter.sendMail(mailOptionsTeacher);
            }

            // 2) Gửi email cho từng sinh viên
            for (const stu of students) {
                const mailOptionsStudent = {
                    from: process.env.EMAIL_USER,
                    to: stu.Email,
                    subject: "The schedule has been updated.",
                    text: `Hi ${stu.Fullname},

Class schedule: ${classData.Classname} has been updated.
- Classroom: ${Address}
- Slot: ${Slot}
- Day: ${formattedDate}

Please check back to the system for details.

Sincerely,
Administration`
                };
                await transporter.sendMail(mailOptionsStudent);
            }

            res.status(200).json(updatedSchedule);
        } catch (err) {
            res.status(500).json({ message: "Failed to update the schedule", error: err.message });
        }
    },


    getScheduleByUserId: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            let classes;
            if (user.Role === 'teacher') {
                classes = await Class.find({ Teacher: userId });
            } else if (user.Role === 'student') {
                classes = await Class.find({ Student: userId });
            }
            if (!classes) {
                return res.status(404).json({ message: `You have not joined any class yet` });
            }
            const schedules = await Schedule.find({ Class: { $in: classes.map(classItem => classItem._id) } })
                .populate({
                    path: 'Class', select: 'Classname',
                    populate: [
                        { path: 'Subject', select: 'Name' },
                        { path: 'Teacher', select: 'Fullname' }
                    ]
                }).populate({path: 'Attendances', select:'IsPresent', match: { Student: userId }});

            if (schedules.length === 0) {
                return res.status(404).json({ message: 'There are no classes scheduled' });
            }
            res.status(200).json({ schedules });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to get schecule', error: error.message });
        }
    },


    deleteSchedule: async (req, res) => {
        try {
            const schedule = await Schedule.findByIdAndDelete(req.params.id);
            if (!schedule) {
                return res.status(404).json({ message: "Schedule not found" });
            }
            const classData = await Class.findById(schedule.Class);
            if (classData) {
                classData.Slots += 1;
                await classData.save();
            }
            await Attendance.deleteMany({ Schedule: schedule._id });
            // ============== THÊM PHẦN GỬI MAIL ==============
            // Lấy giáo viên & sinh viên
            const teacher = await User.findById(classData.Teacher);
            const students = await User.find({ _id: { $in: classData.Student } });
            const formattedDate = schedule.Day.toLocaleDateString();

            // 1) Gửi email cho giáo viên
            if (teacher) {
                const mailOptionsTeacher = {
                    from: process.env.EMAIL_USER,
                    to: teacher.Email,
                    subject: "The class schedule has been deleted.",
                    text: `Hi teacher ${teacher.Fullname},

Class schedule: ${classData.Classname} on the day ${formattedDate} (Slot ${schedule.Slot}, in Classroom ${schedule.Address}) has been deleted.

Please check back to the system for details.

Sincerely,
Administration`
                };
                await transporter.sendMail(mailOptionsTeacher);


                // 2) Gửi email cho từng sinh viên
                for (const stu of students) {
                    const mailOptionsStudent = {
                        from: process.env.EMAIL_USER,
                        to: stu.Email,
                        subject: "The class schedule has been deleted.",
                        text: `Hi ${stu.Fullname},

Class schedule: ${classData.Classname} on the day ${formattedDate} (Slot ${schedule.Slot}, in Classroom ${schedule.Address}) has been deleted.

Please check back to the system for details.

Sincerely,
Administration`
                    };
                    await transporter.sendMail(mailOptionsStudent);
                }
                // ============== KẾT THÚC PHẦN GỬI MAIL ==============
            }

            res.status(200).json({ message: "Schedule deleted successfully" });
        } catch (err) {
            res.status(500).json({ message: "Failed to delete the schedule", error: err.message });
        }
    },

    getScheduleByDay: async (req, res) => {
        try {
            const { day } = req.query;
            if (!day) {
                return res.status(400).json({ message: "Date has not been entered" });
            }
            const date = new Date(day);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            const schedules = await Schedule.find({
                Day: { $gte: startOfDay, $lt: endOfDay }
            })
                .populate({
                    path: 'Class', select: 'Classname',
                    populate: [
                        { path: 'Subject', select: 'Name' },
                        { path: 'Teacher', select: 'Fullname' }
                    ]
                });

            if (!schedules.length) {
                return res.status(404).json({ message: "There are no classes scheduled for this day" });
            }

            res.status(200).json(schedules);
        } catch (error) {
            res.status(500).json({ message: "Failed to get schedule by day", error: error.message });
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
                return res.status(404).json({ message: "Schedule bot found" });
            }
            res.status(200).json(schedule);
        } catch (error) {
            res.status(500).json({ message: "Failed to get schedule", error: error.message });
        }
    }
}

module.exports = scheduleController;