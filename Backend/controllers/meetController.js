const User = require('../models/User'); 
const Meeting = require('../models/Meeting'); 
const { authorize, createSpace, updateMeetingStatus } = require('../services/meetService');
const jwt = require('jsonwebtoken'); 
const { verifyToken } = require('../middlewares/authMiddleware');

async function requestMeeting(req, res) {
  try {
    const { teacherName, reason, meetingType, address, time } = req.body;

    const studentId = req.user.id;

    const student = await User.findById(studentId);
    if (student.Role !== 'student') {
      return res.status(403).json({ message: 'Chỉ học sinh mới có thể gửi yêu cầu gặp giáo viên.' });
    }

    const teacher = await User.findOne({ Fullname: teacherName, Role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: 'Không tìm thấy giáo viên này.' });
    }

    // Tạo yêu cầu meeting với trạng thái Pending
    const meetingRequest = {
      studentId,
      teacherId: teacher._id,
      reason,
      meetingType,
      time,
      address: meetingType === 'offline' ? address : null,  
      status: 'Pending',
    };

    let meetingUrl = null;
    if (meetingType === 'online') {
      const authClient = await authorize();
      meetingUrl = await createSpace(authClient);
      meetingRequest.meetingUrl = meetingUrl;
    }

    const newMeeting = new Meeting(meetingRequest);
    await newMeeting.save();

    student.Meeting.push(newMeeting._id);
    teacher.Meeting.push(newMeeting._id);
    await student.save();
    await teacher.save();

    res.status(201).json({
      message: 'Yêu cầu meeting đã được gửi thành công!',
      // meetingUrl: meetingType === 'online' ? meetingUrl : null,  
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
}

async function handleMeetingRequest(req, res) {
  try {
    const { meetingId, action } = req.body; 
    const teacherId = req.user.id; 

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu cuộc họp này.' });
    }

    if (meeting.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'Bạn không có quyền xử lý yêu cầu này.' });
    }

    if (action === 'accept') {
      meeting.status = 'Accepted';

      if (meeting.meetingType === 'online') {
        const authClient = await authorize();
        const meetingUrl = await createSpace(authClient); // Tạo URL Google Meet
        meeting.meetingUrl = meetingUrl;
      } else {
        meeting.meetingUrl = meeting.address;
      }

      await meeting.save();

      res.status(200).json({
        message: 'Yêu cầu cuộc họp đã được chấp nhận!',
        meetingUrl: meeting.meetingUrl,
      });

    } 
    else if (action === 'reject') {
      meeting.status = 'Rejected';
      await meeting.save();

      res.status(200).json({ message: 'Yêu cầu cuộc họp đã bị từ chối.' });
    } else {
      return res.status(400).json({ message: 'Hành động không hợp lệ.' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
}

async function getAllMeetingRequests(req, res) {
  try {
    // Kiểm tra quyền hạn của Admin
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (user.Role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập vào yêu cầu này.' });
    }

    // Lấy tất cả các yêu cầu meeting từ cơ sở dữ liệu
    const meetings = await Meeting.find()
      .populate('studentId', 'Fullname')  // Lấy thông tin học sinh
      .populate('teacherId', 'Fullname')  // Lấy thông tin giáo viên
      .select('studentId teacherId reason meetingType status');  // Chọn thông tin cần thiết

    // Nếu không có yêu cầu nào
    if (!meetings || meetings.length === 0) {
      return res.status(404).json({ message: 'Không có yêu cầu cuộc họp nào.' });
    }

    // Trả về danh sách yêu cầu cuộc họp
    res.status(200).json({
      message: 'Danh sách yêu cầu cuộc họp:',
      meetings: meetings.map(meeting => ({
        student: meeting.studentId.Fullname,
        teacher: meeting.teacherId.Fullname,
        reason: meeting.reason,
        meetingType: meeting.meetingType,
        status: meeting.status,
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
}

async function getStudentMeetings(req, res) {
  try {
    const studentId = req.user.id; // Lấy ID của học sinh từ token

    const student = await User.findById(studentId);
    if (student.Role !== 'student') {
      return res.status(403).json({ message: 'Chỉ học sinh mới có thể yêu cầu cuộc họp.' });
    }

    // Lấy tất cả các cuộc họp mà học sinh đã gửi
    const meetings = await Meeting.find({ studentId })
      .populate('studentId', 'Fullname')  // Lấy thông tin học sinh
      .populate('teacherId', 'Fullname')  // Lấy thông tin giáo viên
      .select('studentId teacherId reason meetingType status time address meetingUrl');  // Chọn thông tin cần thiết

    if (!meetings || meetings.length === 0) {
      return res.status(404).json({ message: 'Không có yêu cầu cuộc họp nào.' });
    }

    res.status(200).json({
      message: 'Danh sách yêu cầu cuộc họp của học sinh:',
      meetings: meetings.map(meeting => ({
        teacher: meeting.teacherId.Fullname,
        reason: meeting.reason,
        meetingType: meeting.meetingType,
        status: meeting.status,
        time: meeting.time,
        address: meeting.address,
        meetingUrl: meeting.meetingUrl,
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
}

async function getTeacherMeetings(req, res) {
  try {
    const teacherId = req.user.id; // Lấy ID của giáo viên từ token

    const teacher = await User.findById(teacherId);
    if (teacher.Role !== 'teacher') {
      return res.status(403).json({ message: 'Chỉ giáo viên mới có thể nhận cuộc họp.' });
    }

    // Lấy tất cả các cuộc họp mà giáo viên đã nhận
    const meetings = await Meeting.find({ teacherId })
      .populate('studentId', 'Fullname')  // Lấy thông tin học sinh
      .populate('teacherId', 'Fullname')  // Lấy thông tin giáo viên
      .select('studentId teacherId reason meetingType status time address meetingUrl');  // Chọn thông tin cần thiết

    if (!meetings || meetings.length === 0) {
      return res.status(404).json({ message: 'Không có yêu cầu cuộc họp nào.' });
    }

    res.status(200).json({
      message: 'Danh sách yêu cầu cuộc họp của giáo viên:',
      meetings: meetings.map(meeting => ({
        student: meeting.studentId.Fullname,
        reason: meeting.reason,
        meetingType: meeting.meetingType,
        status: meeting.status,
        time: meeting.time,
        address: meeting.address,
        meetingUrl: meeting.meetingUrl,
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
}

module.exports = { requestMeeting, handleMeetingRequest, getAllMeetingRequests, getTeacherMeetings, getStudentMeetings };
