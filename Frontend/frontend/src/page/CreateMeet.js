import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function CreateMeet({ selectedConversation, token: propToken, onClose }) {
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
    // Use the token passed as a prop, or retrieve from localStorage
    const token = propToken || localStorage.getItem('accessToken');

    if (!token) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    const { reason, meetingType, time, address } = meeting;
    
    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    const studentId = decodedToken.id; // Get student ID from token
    const role = decodedToken.Role;

    const MeetingData = {
      teacherName: selectedConversation?.teacherId?.Fullname || "Giáo viên chưa xác định",
      reason,
      meetingType,
      time,
      address: meetingType === "offline" ? address : null,
      studentId, 
    };

    // Validate reason and time
    if (!reason || !time) {
      alert("Vui lòng điền đầy đủ lý do và thời gian cuộc họp.");
      return;
    }

    // Check if selected time is valid (must be after current time)
    const currentTime = new Date();
    const selectedTime = new Date(time);
    if (selectedTime <= currentTime) {
      alert("Thời gian cuộc họp phải sau thời gian hiện tại.");
      return;
    }

    try {
      // Check if role is 'student'
      if (role !== 'student') {
        alert("Bạn không có quyền tạo cuộc họp. Chỉ học sinh mới có thể thực hiện.");
        return;
      }

      // Send meeting creation request
      console.log('Sending meeting data:', MeetingData);
      console.log('Token:', token);

      const res = await axios.post(
        "http://localhost:8000/meet/request-meeting", 
        MeetingData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      alert(res.data.message); // Show success message
      onClose(); // Close form
    } catch (error) {
      // Detailed error logging
      console.error("Full error object:", error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        // Specific error handling based on status code
        switch (error.response.status) {
          case 401:
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            break;
          case 403:
            alert("Bạn không có quyền thực hiện thao tác này.");
            break;
          case 400:
            alert(error.response.data.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
            break;
          default:
            alert("Đã có lỗi xảy ra khi tạo cuộc họp. Vui lòng thử lại sau.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        alert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="p-4 bg-white border-t">
      <h3 className="font-bold">
        Tạo cuộc họp với {selectedConversation?.teacherId?.Fullname || "Giáo viên chưa xác định"}
      </h3>

      {/* Meeting reason input */}
      <input
        type="text"
        name="reason"
        placeholder="Lý do cuộc họp"
        value={meeting.reason}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-md mt-2"
      />

      {/* Meeting time input */}
      <input
        type="datetime-local"
        name="time"
        value={meeting.time}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-md mt-2"
      />

      {/* Meeting type selection */}
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

      {/* Address input for offline meetings */}
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

      {/* Submit and cancel buttons */}
      <button
        onClick={handleCreateMeeting}
        className="bg-blue-500 text-white p-2 rounded-md mt-4"
      >
        Gửi yêu cầu
      </button>

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