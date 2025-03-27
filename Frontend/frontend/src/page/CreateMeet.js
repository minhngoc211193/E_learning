import React, { useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

function CreateMeet({ selectedConversation, token, onClose }) {
  const [meeting, setMeeting] = useState({
    reason: "",
    meetingType: "online",
    time: "",
    address: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeeting((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleCreateMeeting = async () => {
    const { reason, meetingType, time, address } = meeting;
    const decodedToken = jwtDecode(token);
    const studentId = decodedToken.id; // Lấy ID của học sinh từ token
    const role = decodedToken.Role;
    const MeetingData = {
        teacherName: selectedConversation?.teacherId?.Fullname || "Giáo viên chưa xác định", // Kiểm tra sự tồn tại của teacherName
        reason,
        meetingType,
        time,
        address: meetingType === "offline" ? address : null,
        studentId, 
    };

    // Kiểm tra nếu lý do cuộc họp hoặc thời gian trống
    if (!reason || !time) {
      alert("Vui lòng điền đầy đủ lý do và thời gian cuộc họp.");
      return;
    }

    // Kiểm tra xem thời gian đã chọn có hợp lệ không (phải sau thời điểm hiện tại)
    const currentTime = new Date();
    const selectedTime = new Date(time);
    if (selectedTime <= currentTime) {
      alert("Thời gian cuộc họp phải sau thời gian hiện tại.");
      return;
    }

    // Giải mã token để lấy thông tin người dùng
    try {


      // Kiểm tra role là 'student'
      if (role !== 'student') {
        alert("Bạn không có quyền tạo cuộc họp. Chỉ học sinh mới có thể thực hiện.");
        return;
      }

      // Gửi yêu cầu tạo cuộc họp
      const res = await axios.post(
        "http://localhost:8000/meet/request-meeting", MeetingData ,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message); // Hiển thị thông báo khi tạo thành công
      onClose(); // Đóng form
    } catch (error) {
      console.error("Lỗi khi tạo cuộc họp:", error);
      alert("Đã có lỗi xảy ra khi tạo cuộc họp.");
    }
  };

  return (
    <div className="p-4 bg-white border-t">
      <h3 className="font-bold">
        Tạo cuộc họp với {selectedConversation?.teacherId?.Fullname || "Giáo viên chưa xác định"}
      </h3>

      {/* Form nhập lý do cuộc họp */}
      <input
        type="text"
        name="reason"
        placeholder="Lý do cuộc họp"
        value={meeting.reason}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-md mt-2"
      />

      {/* Form chọn thời gian cuộc họp */}
      <input
        type="datetime-local"
        name="time"
        value={meeting.time}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-md mt-2"
      />

    <div className="mt-2">
        <label className="mr-4">
          <input
            type="radio"
            name="meetingType"
            value="online"
            checked={meeting.meetingType === "online"}
            onChange={handleInputChange}
          />
          Online
        </label>
        <label>
          <input
            type="radio"
            name="meetingType"
            value="offline"
            checked={meeting.meetingType === "offline"}
            onChange={handleInputChange}
          />
          Offline
        </label>
      </div>

      {meeting.meetingType === "offline" && (
        <input
          type="text"
          name="address"
          placeholder="Nhập địa chỉ cuộc họp"
          value={meeting.address}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md mt-2"
        />
      )}

      {/* Nút gửi yêu cầu tạo cuộc họp */}
      <button
        onClick={handleCreateMeeting}
        className="bg-blue-500 text-white p-2 rounded-md mt-4"
      >
        Gửi yêu cầu
      </button>

      {/* Nút hủy form */}
      <button
        onClick={onClose}
        className="ml-2 bg-gray-500 text-white p-2 rounded-md mt-4"
      >
        Hủy
      </button>
    </div>
  );
}

export default CreateMeet;
