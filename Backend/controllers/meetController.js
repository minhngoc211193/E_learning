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
      return res.status(403).json({ message: 'Only students can send requests to meet with teachers.' });
    }

    const teacher = await User.findById(teacherId);  //findOne to finById
    if (!teacher) {
      return res.status(404).json({ message: 'This teacher was not found.' });
    }

    const meetingTime = new Date(time);
    const currentTime = new Date();
    if (meetingTime <= currentTime) {
      return res.status(400).json({
        message: 'No appointments can be made at this time.'
      });
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
      `You have a new meeting request from a student: ${student.Fullname}`
    );
    const io = req.app.get('io');
    if (notification && io) {
      io.to(teacher._id.toString()).emit('receive notification', notification);
    }

    res.status(201).json({
      message: 'Meeting request sent successfully!',
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred, please try again.' });
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
      return res.status(404).json({ message: 'No meeting request found.' });
    }

    if (meetingRequest.teacherId.toString() !== teacherId) {
      return res.status(403).json({ message: 'Only teachers can respond to meeting requests.' });
    }

    if (meetingRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'This meeting request has been responded to previously.' });
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
        `Your meeting request was declined by ${teacher.Fullname}. Reason: ${rejectionReason || 'No reason'}`
      );

      if (io && notification) {
        io.to(studentId.toString()).emit('receive notification', notification);
      }

      return res.status(200).json({
        message: 'The meeting request was denied.',
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
        ? `Google Meet Link: ${meetingRequest.meetingUrl}` 
        : 'The format is offline, no google meet link.';
      
      const notification = await createNotification(
        teacherId,  
        studentId,  
        'MEETING_ACCEPTED',
        `Your meeting request has been accepted by ${teacher.Fullname}. ${linkMessage}`
      );

      if (io && notification) {
        io.to(studentId.toString()).emit('receive notification', notification);
      }

      return res.status(200).json({
        message: 'The meeting request has been accepted.',
        meetingUrl: meetingRequest.meetingUrl
      });
    }

    return res.status(400).json({ message: 'Invalid response.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred, please try again.' });
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
      res.status(403).json({ message: 'Invalid access.' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred, please try again.' });
  }
};

const deleteMeetingRequest = async (req, res) => {
  try {
    const { meetingId } = req.body;
    const studentId = req.user.id; 

    const meetingRequest = await Meeting.findById(meetingId);

    if (!meetingRequest) {
      return res.status(404).json({ message: 'No meeting request found.' });
    }

    if (meetingRequest.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'Only the student who created this request can delete it.' });
    }

    if (meetingRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'Only meeting requests that are awaiting a response can be deleted.' });
    }
    await meetingRequest.deleteOne();

    res.status(200).json({ message: 'The meeting request was successfully deleted.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred, please try again.' });
  }
};

async function updateMeetingRequest(req, res) {
  try {
    const { meetingId } = req.body; 
    const { time, meetingType, address } = req.body; 
    const studentId = req.user.id;  

    const student = await User.findById(studentId);
    if (!student || student.Role !== 'student') {
      return res.status(403).json({ message: 'Only students can update meeting requests.' });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'No meeting requests found.' });
    }

    if (meeting.studentId.toString() !== studentId) {
      return res.status(403).json({ message: 'You do not have permission to edit this meeting request.' });
    }

    if (meeting.status !== 'Pending') {
      return res.status(400).json({ message: 'Only meeting requests that are in Pending status can be updated.' });
    }

    const isTimeProvided = time !== undefined && time !== null;
    const isMeetingTypeProvided = meetingType !== undefined && meetingType !== null;

    if (!isTimeProvided && !isMeetingTypeProvided) {
      return res.status(400).json({
        message: 'You need to update at least one of two fields: time or meetingType.'
      });
    }

    if (isMeetingTypeProvided) {
      // Kiểm tra hợp lệ Enum
      if (!['online', 'offline'].includes(meetingType)) {
        return res.status(400).json({ message: 'meetingType is not valid.' });
      }

      // Nếu chuyển từ online sang offline => cần address
      if (meeting.meetingType === 'online' && meetingType === 'offline') {
        if (!address) {
          return res.status(400).json({
            message: 'When switching from online to offline, you must enter an address.'
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
          message: 'Cannot set time in the past.'
        });
      }
    
      meeting.time = providedTime;
    }

    await meeting.save();

    res.status(200).json({
      message: 'Meeting request updated successfully.',
      meeting
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred, please try again later.' });
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