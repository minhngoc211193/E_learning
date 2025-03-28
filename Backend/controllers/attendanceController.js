const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const mime = require('mime-types');

const addAttendanceForNewStudent = async (classId, studentId) => {
  try {
    const classInfo = await Class.findById(classId);
    if (!classInfo) {
      console.error("Không tìm thấy lớp học.");
      return;
    }

    const teacherId = classInfo.Teacher;
    const schedules = await Schedule.find({ Class: classId });

    for (const schedule of schedules) {
      const attendanceExists = await Attendance.findOne({
        Schedule: schedule._id,
        Student: studentId
      });

      const currentDate = new Date();
      const scheduleDate = new Date(schedule.Day);

      let isPresentStatus = "pending";
      if (scheduleDate < currentDate) {
        isPresentStatus = "absent";
      }

      if (!attendanceExists) {
        const newAttendance = new Attendance({
          Schedule: schedule._id,
          Student: studentId,
          Teacher: teacherId,
          IsPresent: isPresentStatus,
          Date: schedule.Day
        });

        await newAttendance.save();
      }
    }
  } catch (err) {
    console.error("Lỗi khi tạo điểm danh cho học sinh:", err.message);
  }
};


const attendanceController = {
  updateAttendance: async (req, res) => {
    try {
      const { students, scheduleId } = req.body;
      const schedule = await Schedule.findById(scheduleId).populate('Class', select = 'Teacher');

      if (!schedule) {
        return res.status(404).json({ message: "Không tìm thấy lịch học" });
      }
      const currentDate = new Date();
      const scheduleDate = new Date(schedule.Day);
      const previousDayUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));

      if (schedule.Class.Teacher.toString() !== req.user.id && req.user.Role !== 'admin') {
        return res.status(403).json({ message: "Bạn không phải giáo viên của lớp này" });
      }

      if (req.user.Role === 'admin') {
        if (scheduleDate > previousDayUTC) {
          return res.status(400).json({ message: "Bạn không thể sửa điểm danh cho lịch học chưa đến." });
        }
      }

      if (req.user.Role === 'teacher') {
        const nextDay = new Date(scheduleDate);
        nextDay.setDate(scheduleDate.getDate() + 1);

        if (previousDayUTC < scheduleDate || previousDayUTC > nextDay) {
          return res.status(400).json({
            message: "Bạn chỉ có thể sửa điểm danh trong ngày của lịch học và ngày hôm sau."
          });
        }
      }

      const errorMessages = [];
      const attendanceUpdates = students.map(async (student) => {
        const attendance = await Attendance.findOne({
          Schedule: scheduleId,
          Student: student.studentId,
        });

        if (!attendance) {
          errorMessages.push({ studentId: student.studentId, error: `Không tìm thấy bản ghi điểm danh của sinh viên ${student.studentId}` });
          return;
        }
        attendance.IsPresent = student.isPresent;
        attendance.Comment = student.comment || "";

        await attendance.save();
      });
      await Promise.all(attendanceUpdates);

      if (errorMessages.length > 0) {
        return res.status(400).json({
          message: "Cập nhật điểm danh không thành công",
          errors: errorMessages
        });
      }
      res.status(200).json({ message: "Cập nhật điểm danh thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật điểm danh", error: error.message });
    }
  },

  getAttendanceBySchedule: async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const schedule = await Schedule.findById(scheduleId).populate('Class', select = 'Teacher');

      const currentDate = new Date();
      const previousDayUTC = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate()));
      if (previousDayUTC < schedule.Day) {
        return res.status(400).json({
          message: "Lịch học chưa diễn ra."
        });
      }
      if (schedule.Class.Teacher.toString() !== req.user.id && req.user.Role !== 'admin') {
        return res.status(403).json({ message: "Bạn không phải giáo viên của lớp này" });
      }

      const attendanceRecords = await Attendance.find({ Schedule: scheduleId })
        .populate({
          path: 'Student',
          select: 'Fullname Username Image',
        });

      if (!attendanceRecords || attendanceRecords.length === 0) {
        return res.status(404).json({ message: "Không có bản ghi điểm danh cho lịch học này." });
      }

      const usersWithImage = attendanceRecords.map(image => {
        let imageBase64 = null;
        if (image.Student.Image) {
          const mimeType = mime.lookup(image.Student.Image) || 'image/png';  // Lấy loại ảnh
          imageBase64 = `data:${mimeType};base64,${image.Student.Image.toString('base64')}`;
        }
        return {
          ...image.toObject(),
          Student: {
            ...image.Student.toObject(),
            Image: imageBase64
          }
        }
      })

      res.status(200).json({ usersWithImage });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy bản ghi điểm danh", error: error.message });
    }
  },
};
module.exports = { attendanceController, addAttendanceForNewStudent };