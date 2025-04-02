const User = require('../models/User'); 
const Meeting = require('../models/Meeting'); 
const { authorize, createSpace } = require('../services/meetService');
const {createNotification} = require('./notificationController');


async function requestMeeting(req, res) {
  try {
    //  change teacherName - teacherId
    const { teacherId, reason, meetingType, address, time } = req.body;
    const studentId = req.user.id;

    const student = await User.findById(studentId);
    if (student.Role !== 'student') {
      return res.status(403).json({ message: 'Chỉ học sinh mới có thể gửi yêu cầu gặp giáo viên.' });
    }

    const teacher = await User.findById(teacherId);  //findOne to finById
    if (!teacher) {
      return res.status(404).json({ message: 'Không tìm thấy giáo viên này.' });
    }

    const meetingRequest = {
      studentId,
      teacherId, // give teacherId
      reason,
      meetingType,
      time,
      address: meetingType === 'offline' ? address : null,  
      status: 'Pending',
      meetingUrl: ""
    };

    const newMeeting = new Meeting(meetingRequest);
    await newMeeting.save();

    student.Meeting.push(newMeeting._id);
    teacher.Meeting.push(newMeeting._id);
    await student.save();
    await teacher.save();
    // add to create noti
    const notification = await createNotification(
      studentId,          
      teacher._id,       
      'MEETING_REQUEST', 
      `Bạn có một yêu cầu meeting mới từ học sinh: ${student.Fullname}`
    );
    const io = req.app.get('io');
    if (notification && io) {
      io.to(teacher._id.toString()).emit('new notification', notification);
    }

    res.status(201).json({
      message: 'Yêu cầu meeting đã được gửi thành công!',
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
};

const getMeetings = async (req, res) => {
  const userId = req.user.id; 
  const userRole = req.user.Role;

  let meetings;
  try {
    if (userRole === 'student') {
      meetings = await Meeting.find({ studentId: userId })
        .populate('teacherId', 'Fullname email') 
        .select('studentId teacherId reason meetingType status time address meetingUrl createdAt updatedAt'); 
    } else if (userRole === 'teacher') {
      meetings = await Meeting.find({ teacherId: userId })
        .populate('studentId', 'Fullname email') 
        .select('studentId teacherId reason meetingType status time address meetingUrl createdAt updatedAt'); 
    } else if (userRole === 'admin') {
      meetings = await Meeting.find()
        .populate('studentId', 'Fullname email') 
        .populate('teacherId', 'Fullname email')
        .select('studentId teacherId reason meetingType status time address meetingUrl createdAt updatedAt'); 
    }

    res.status(200).json({ meetings });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
};

const respondToMeetingRequest = async (req, res) => {
  try {
    const { meetingId, action, rejectionReason } = req.body; 
    const teacherId = req.user.id; 

    const meetingRequest = await Meeting.findById(meetingId);
    if (!meetingRequest) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu cuộc họp.' });
    }

    if (meetingRequest.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'Chỉ giáo viên mới có thể trả lời yêu cầu cuộc họp.' });
    }

    if (meetingRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Yêu cầu cuộc họp này đã được phản hồi trước đó.' });
    }

    const teacher = await User.findById(teacherId);
    const studentId = meetingRequest.studentId;

    const io = req.app.get('io'); 

    if (action === 'reject') {
      meetingRequest.status = 'Rejected';
      meetingRequest.rejectionReason = rejectionReason; 
      await meetingRequest.save();

      const notification = await createNotification(
        teacherId, 
        studentId,  
        'MEETING_REJECTED',
        `Yêu cầu cuộc họp của bạn đã bị từ chối bởi ${teacher.Fullname}. Lý do: ${rejectionReason || 'Không có'}`
      );

      if (io && notification) {
        io.to(studentId.toString()).emit('new notification', notification);
      }

      return res.status(200).json({
        message: 'Yêu cầu cuộc họp đã bị từ chối.',
        rejectionReason
      });
    }

    if (action === 'accept') {
      meetingRequest.status = 'Accepted';

      if (meetingRequest.meetingType === 'online') {
        const authClient = await authorize();
        const meetingUrl = await createSpace(authClient);
        meetingRequest.meetingUrl = meetingUrl;
      } else if (meetingRequest.meetingType === 'offline') {
        meetingRequest.meetingUrl = null; 
      }
      await meetingRequest.save();

      const linkMessage = meetingRequest.meetingType === 'online' 
        ? `Link Google Meet: ${meetingRequest.meetingUrl}` 
        : 'Hình thức là offline, không có link gôgle mêt.';
      
      const notification = await createNotification(
        teacherId,  
        studentId,  
        'MEETING_ACCEPTED',
        `Yêu cầu cuộc họp của bạn đã được chấp nhận bởi ${teacher.Fullname}. ${linkMessage}`
      );

      if (io && notification) {
        io.to(studentId.toString()).emit('new notification', notification);
      }

      return res.status(200).json({
        message: 'Yêu cầu cuộc họp đã được chấp nhận.',
        meetingUrl: meetingRequest.meetingUrl
      });
    }

    return res.status(400).json({ message: 'Phản hồi không hợp lệ.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
};

const searchMeetings = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.Role;
  const searchText = req.query.searchText; 

  let meetings;
  try {
    if (userRole === 'student') {
      meetings = await Meeting.find({ studentId: userId })
        .populate('teacherId', 'Fullname')
        .select('teacherId reason status time meetingType');
      
        const filteredMeetings = meetings.filter(meeting =>
          meeting.teacherId.Fullname.toLowerCase().includes(searchText.toLowerCase())
        );

      res.status(200).json({ meetings: filteredMeetings });

    } else if (userRole === 'teacher') {
      meetings = await Meeting.find({ teacherId: userId })
        .populate('studentId', 'Fullname') 
        .select('studentId reason status time meetingType');

      const filteredMeetings = meetings.filter(meeting =>
        meeting.studentId.Fullname.toLowerCase().includes(searchText.toLowerCase())
      );

      res.status(200).json({ meetings: filteredMeetings });

    } else if (userRole === 'admin') {
      meetings = await Meeting.find()
        .populate('studentId', 'Fullname') 
        .populate('teacherId', 'Fullname') 
        .select('studentId teacherId reason status time meetingType');

      const filteredMeetings = meetings.filter(meeting =>
        meeting.studentId.Fullname.toLowerCase().includes(searchText.toLowerCase()) ||
        meeting.teacherId.Fullname.toLowerCase().includes(searchText.toLowerCase())
      );

      res.status(200).json({ meetings: filteredMeetings });

    } else {
      res.status(403).json({ message: 'Quyền truy cập không hợp lệ.' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
};

const deleteMeetingRequest = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const studentId = req.user.id; 

    const meetingRequest = await Meeting.findById(meetingId);

    if (!meetingRequest) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu cuộc họp.' });
    }

    if (meetingRequest.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Chỉ học sinh tạo ra yêu cầu này mới có thể xóa.' });
    }

    if (meetingRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Chỉ có yêu cầu cuộc họp đang chờ phản hồi mới có thể xóa.' });
    }
    await meetingRequest.deleteOne();

    res.status(200).json({ message: 'Yêu cầu cuộc họp đã được xóa thành công.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
  }
};

async function updateMeetingRequest(req, res) {
  try {
    const { meetingId } = req.body; 
    const { time, meetingType, address } = req.body; 
    const studentId = req.user.id;  

    const student = await User.findById(studentId);
    if (!student || student.Role !== 'student') {
      return res.status(403).json({ message: 'Chỉ học sinh mới có thể cập nhật yêu cầu họp.' });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu họp.' });
    }

    if (meeting.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa yêu cầu họp này.' });
    }

    if (meeting.status !== 'Pending') {
      return res.status(400).json({ message: 'Chỉ có thể cập nhật yêu cầu họp đang ở trạng thái Pending.' });
    }

    const isTimeProvided = time !== undefined && time !== null;
    const isMeetingTypeProvided = meetingType !== undefined && meetingType !== null;

    if (!isTimeProvided && !isMeetingTypeProvided) {
      return res.status(400).json({
        message: 'Bạn cần cập nhật ít nhất 1 trong 2 trường: time hoặc meetingType.'
      });
    }

    if (isMeetingTypeProvided) {
      // Kiểm tra hợp lệ Enum
      if (!['online', 'offline'].includes(meetingType)) {
        return res.status(400).json({ message: 'meetingType không hợp lệ.' });
      }

      // Nếu chuyển từ online sang offline => cần address
      if (meeting.meetingType === 'online' && meetingType === 'offline') {
        if (!address) {
          return res.status(400).json({
            message: 'Khi chuyển từ online sang offline, bạn phải nhập địa chỉ (address).'
          });
        }
        meeting.address = address; // Cập nhật địa chỉ
      }

      // Nếu chuyển từ offline sang online => xóa address
      if (meeting.meetingType === 'offline' && meetingType === 'online') {
        meeting.address = null;
      }

      meeting.meetingType = meetingType;
    }

    if (isTimeProvided) {
      const providedTime = new Date(time);
      if (providedTime < new Date()) {
        return res.status(400).json({
          message: 'Không thể đặt thời gian ở quá khứ.'
        });
      }
    
      meeting.time = providedTime;
    }

    await meeting.save();

    res.status(200).json({
      message: 'Cập nhật yêu cầu họp thành công.',
      meeting
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
  }
};

module.exports = { requestMeeting, getMeetings, respondToMeetingRequest, searchMeetings, deleteMeetingRequest, updateMeetingRequest };

// Cấm xóa 
// const searchMeetings = async (req, res) => {
//   const userId = req.user.id;
//   const userRole = req.user.Role;
//   const searchText = req.query.searchText; 

//   let meetings;
//   try {
//     const regex = new RegExp(searchText, 'i'); // Tạo một biểu thức chính quy không phân biệt chữ hoa, chữ thường

//     if (userRole === 'student') {
//       meetings = await Meeting.find({ studentId: userId })
//         .populate('teacherId', 'Fullname')
//         .select('teacherId reason status time meetingType');

    // res.status(200).json({
    //   message: 'Danh sách yêu cầu cuộc họp của giáo viên:',
    //   meetings
    // });

//       // Tìm kiếm trong tất cả các trường của meeting
//       const filteredMeetings = meetings.filter(meeting =>
//         meeting.teacherId.Fullname.match(regex) || 
//         meeting.reason.match(regex) ||
//         meeting.status.match(regex) ||
//         meeting.meetingType.match(regex)
//       );


//       res.status(200).json({ meetings: filteredMeetings });

//     } else if (userRole === 'teacher') {
//       meetings = await Meeting.find({ teacherId: userId })
//         .populate('studentId', 'Fullname') 
//         .select('studentId reason status time meetingType');

//       // Tìm kiếm trong tất cả các trường của meeting
//       const filteredMeetings = meetings.filter(meeting =>
//         meeting.studentId.Fullname.match(regex) || 
//         meeting.reason.match(regex) ||
//         meeting.status.match(regex) ||
//         meeting.meetingType.match(regex)
//       );

//       res.status(200).json({ meetings: filteredMeetings });

//     } else if (userRole === 'admin') {
//       meetings = await Meeting.find()
//         .populate('studentId', 'Fullname') 
//         .populate('teacherId', 'Fullname') 
//         .select('studentId teacherId reason status time meetingType');

//       // Tìm kiếm trong tất cả các trường của meeting
//       const filteredMeetings = meetings.filter(meeting =>
//         meeting.studentId.Fullname.match(regex) || 
//         meeting.teacherId.Fullname.match(regex) ||
//         meeting.reason.match(regex) ||
//         meeting.status.match(regex) ||
//         meeting.meetingType.match(regex)
//       );

//       res.status(200).json({ meetings: filteredMeetings });

//     } else {
//       res.status(403).json({ message: 'Quyền truy cập không hợp lệ.' });
//     }

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại.' });
//   }
// };