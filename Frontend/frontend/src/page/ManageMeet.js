import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Menu from '../components/Menu';
import { notification } from "antd";

function ManageMeeting() {
  const [meetings, setMeetings] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMeeting, setCurruntMeeting] = useState(null);
  const [editedMeeting, setEditedMeeting] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const decoded = jwtDecode(token);
  const userId = decoded.id;
  const role = decoded.Role;
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (type, detailMessage = "") => {
    if (type === "success") {
      api.open({
        message: "Action uccessfully!",
        description: "Your action has been successfully.",
        showProgress: true,
        pauseOnHover: true,
      });
    } else {
      api.open({
        message: "Failed!",
        description: detailMessage,
        showProgress: true,
        pauseOnHover: true,
      });
    }
  };
  useEffect(() => {
    if (token) {
      fetchMeetings();
    }
  }, [token]);

  const fetchMeetings = async () => {
    const decoded = jwtDecode(token);
    const userId = decoded.id;
    const role = decoded.Role;
    setUserRole(role);
    try {
      let response;
      if (role === "student") {
        response = await axios.get("http://localhost:8000/meet/meetings", {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (role === "teacher") {
        response = await axios.get("http://localhost:8000/meet/meetings", {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      console.log("Lich meeting: ", response.data.meetings);
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error("Error fetching meetings: ", error);
    }
  };


  const handleConfirm = async (meetingId) => {
    const decoded = jwtDecode(token);
    const role = decoded.Role;

    if (role !== "teacher") {
      openNotification("error", "Just teacher can confirm meetings");
    }
    try {
      const response = await axios.post("http://localhost:8000/meet/respond-meeting", {
        meetingId, action: "accept"
      },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("Meeting confirmed response: ", response);
      openNotification("success");
      fetchMeetings();
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Have problem, plase try again!";
      openNotification("error", errorMessage);
    }
  };
  const handleReject = async (meetingId) => {
    const decoded = jwtDecode(token);
    const role = decoded.Role;
    if (role !== "teacher") {
      openNotification("error", "Just teacher can confirm meetings");
    }
    try {
      const response = await axios.post("http://localhost:8000/meet/respond-meeting",
        {
          meetingId, action: "reject"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Meeting rejected response: ", response);
      openNotification("success");
      fetchMeetings();
    } catch (e) {
      const errorMessage = e.response?.data?.message || "Have problem, plase try again!";
      openNotification("error", errorMessage);
    }
  };
  const handleEdit = (meeting) => {
    setCurruntMeeting(meeting);
    setEditedMeeting(meeting);
    setIsEditing(true);

  }
  // const handleInputChange = (e) =>{
  //     const {name, value} = e.target;
  //     setEditedMeeting({
  //         ...editedMeeting,
  //         [name]: value
  //     });
  //     };

  // const handleSave = async()=>{
  //     try{
  //         const response = await axios.put(`https://localhost:8000/meet/`)
  //     }catch{}
  // };
  return (
    <div className="meeting-list">
      {contextHolder}
      <h2>Danh sách cuộc họp</h2>
      {/* {isEditing && currentMeeting && (
        <div className="edit-meeting-form">
          <h3>Chỉnh sửa cuộc họp</h3>
          <label>
            Lý do:
            <input
              type="text"
              name="reason"
              value={editedMeeting.reason || ""}
              onChange={handleInput}
            />
          </label>
          <label>
            Loại cuộc họp:
            <select
              name="meetingType"
              value={editedMeeting.meetingType || ""}
              onChange={handleInputChange}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </label>
          <label>
            Thời gian:
            <input
              type="datetime-local"
              name="time"
              value={editedMeeting.time || ""}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Địa chỉ:
            <input
              type="text"
              name="address"
              value={editedMeeting.address || ""}
              onChange={handleInputChange}
            />
          </label>
          <button onClick={handleSaveChanges}>Lưu thay đổi</button>
          <button onClick={() => setIsEditing(false)}>Hủy</button>
        </div>
      )} */}
      <table>
        <thead>
          <tr>
            <th>Giáo viên</th>
            <th>Lý do</th>
            <th>Loại cuộc họp</th>
            <th>Thời gian</th>
            <th>Địa chỉ</th>
            {role === "teacher" && <th>Hành động</th>}
            {role === "student" && <th>Chỉnh sửa</th>}
          </tr>
        </thead>
        <tbody>
          {meetings.length === 0 ? (
            <tr>
              <td colSpan="6">Không có cuộc họp nào.</td>
            </tr>
          ) : (
            meetings.map((meeting) => (
              <tr key={meeting._id}>
                <td>{meeting.teacher}</td>
                <td>{meeting.reason}</td>
                <td>{meeting.meetingType}</td>
                <td>{new Date(meeting.time).toLocaleString()}</td>
                <td>{meeting.address || "N/A"}</td>
                {role === "teacher" && (
                  <td>
                    {meeting.status === "Pending" && (
                      <>
                        <button onClick={() => handleConfirm(meeting._id)}>Chấp nhận</button>
                        <button onClick={() => handleReject(meeting._id)}>Từ chối</button>
                      </>
                    )}
                    {meeting.status === "Accepted" && <span>Đã xác nhận</span>}
                    {meeting.status === "Rejected" && <span>Đã từ chối</span>}
                  </td>
                )}
                {role === "student" && (
                  <td>
                    {meeting.status === "Pending" && (
                      <button onClick={() => handleEdit(meeting)}>Chỉnh sửa</button>
                    )}
                    {meeting.status !== "Pending" && <span>Đã xử lý</span>}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

  );

}

export default ManageMeeting;