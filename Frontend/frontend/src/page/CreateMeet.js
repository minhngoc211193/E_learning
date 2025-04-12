import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import styles from './CreateMeet.module.css';
import { notification } from "antd";

function CreateMeet({ selectedConversationId, setIsMeetingFormVisible }) {
  const [meeting, setMeeting] = useState({
    reason: "",
    meetingType: "online",
    time: "",
    address: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const [api, contextHolder] = notification.useNotification();
  
    const openNotification = (type, detailMessage = "") => {
      if (type === "success") {
        api.open({
          message: "Create meeting successfully!",
          description: "Meeting has been created successfully.",
          showProgress: true,
          pauseOnHover: true,
        });
      } else {
        api.open({
          message: "Create meeting failed!",
          description: detailMessage,
          showProgress: true,
          pauseOnHover: true,
        });
      }
    };

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
      teacherId: selectedConversationId?.teacherId?._id,
      reason,
      meetingType,
      time,
      address: meetingType === "offline" ? address : "null ",
    };

    if (!reason || !time) {
      openNotification("error", "Please fullfill time and reason");
      return;
    }

    const currentTime = new Date();
    const selectedTime = new Date(time);
    if (selectedTime <= currentTime) {
      openNotification("error", "Time of meet have to after now");
      return;
    }

    try {
      if (role !== 'student') {
        openNotification("error", "You are not allow create meeting. Just student can create");
        return;
      }

      const res = await axios.post(
        "http://localhost:8000/meet/request-meeting", 
        MeetingData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      openNotification("success");
      setTimeout(() =>setIsMeetingFormVisible(false),2000); // Đóng form khi tạo thành công
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Have problem, plase try again!";
      openNotification("error", errorMessage);
    }
  };

  return (
    <div className={styles["create-meet-container"]}>
      {contextHolder}
      <h3 className={styles["create-meet-title-bold"]}>
        Create meeting with {selectedConversationId?.teacherId?.Fullname || "Teacher is not available"}
      </h3>
      <input
        type="text"
        name="reason"
        placeholder="Lý do cuộc họp"
        value={meeting.reason}
        onChange={handleInputChange}
        className={styles["create-meet-input"]}
      />
      <input
        type="datetime-local"
        name="time"
        value={meeting.time}
        onChange={handleInputChange}
        className={styles["create-meet-input"]}
      />
      <div className={styles["create-meet-radio-group"]}>
        <label>
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
          className={styles["wcreate-meet-input"]}
        />
      )}
      <button onClick={handleCreateMeeting} className={styles["create-meet-button"]}>
        Create Meet
      </button>
      <button onClick={() => setIsMeetingFormVisible(false)} className={styles["create-meet-cancel"]}>
      Cancel
      </button>
    </div>
  );
}

export default CreateMeet;
