import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from '../components/Header';
import { notification } from "antd";
import styles from "./ManageMeet.module.css"

function ManageMeeting (){
    const [meetings, setMeetings] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMeeting, setCurrentMeeting] = useState(null);
    const [editedMeeting, setEditedMeeting] = useState({});
    const [rejectedMeetingId, setRejectedMeetingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
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
        if(token){
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
  const handleStartReject = (meetingId) => {
    setRejectedMeetingId(meetingId);
    setRejectionReason("");  // reset lý do cũ
  };
  const handleReject = async (meetingId, rejectionReason) =>{

      if(!rejectionReason || rejectionReason.trim() ===""){
        openNotification("Vui lòng nhập lý do từ chối.");
        return;
      }
      try{
        const decoded = jwtDecode(token);
        const role = decoded.Role;
        if(role!=="teacher"){
          openNotification("Just teacher can reject meeting!");
            return;
        }
          const response = await axios.post("http://localhost:8000/meet/respond-meeting", 
              {
              meetingId, action: "reject", rejectionReason
              },
              {headers: {Authorization: `Bearer ${token}`}}
      );
      console.log("Meeting rejected response: ", response);
          openNotification ("Meeting was rejected!");
          setRejectedMeetingId(null);
          setRejectionReason("");
          // reload data
          fetchMeetings();
      } catch(e){
        const errorMessage = e.response?.data?.message || "Have problem, plase try again!";
        openNotification("Error rejectng meeting", errorMessage);
      }
  };
  const handleEdit = (meeting) => {
    setCurrentMeeting(meeting);
    setEditedMeeting({
      reason: meeting.reason || "",
      meetingType: meeting.meetingType || "online",
      time: new Date(meeting.time).toISOString().slice(0,16),
      address: meeting.address || "",
    });
    setIsEditing(true);

  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMeeting((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSaveChanges = async () => {
    try {
      const decoded = jwtDecode(token);
      if (decoded.Role !== "student") {
        alert("Chỉ student mới có quyền chỉnh sửa!");
        return;
      }

      await axios.put(
        `http://localhost:8000/meet/update/${currentMeeting._id}`,
        {
          meetingId: currentMeeting._id,
          time: editedMeeting.time,
          meetingType: editedMeeting.meetingType,
          address: editedMeeting.address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Đã lưu thay đổi!");
      setIsEditing(false);
      setCurrentMeeting(null);
      fetchMeetings();
    } catch (err) {
      console.error("Lỗi khi lưu thay đổi:", err);
      alert("Lưu thất bại, vui lòng thử lại.");
    }
  };


  return (
    <div className={styles["meeting-list"]}>
      <Header/>
      {contextHolder}
      <h2>List of meeting</h2>
      {role === "student" && isEditing && currentMeeting && (
    <div className={styles["edit-meeting-form"]}>
      <h3>Edit meeting</h3>
      <label>
        Reason:
        <input
          type="text"
          name="reason"
          value={editedMeeting.reason || ""}
          onChange={handleInputChange} readOnly
        />
      </label>
      <label>
      Type of Meeting:
      <select
        name="meetingType"
        value={editedMeeting.meetingType || ""}
        onChange={handleInputChange}
      >
        <option value="online">Online</option>
        <option value="offline">Offline</option>
      </select>
    </label>
    {editedMeeting.meetingType === "offline" && (
      <label>
        Address:
        <input
          type="text"
          name="address"
          value={editedMeeting.address || ""}
          onChange={handleInputChange}
        />
      </label>
    )}

      <label>
      Time:
      <input
        type="datetime-local"
        name="time"
        value={editedMeeting.time || ""}
        onChange={handleInputChange}
      />
    </label>
      {/* các trường khác tương tự */}
      <button onClick={handleSaveChanges}>Save Change</button>
      <button onClick={() => setIsEditing(false)}>Cancel</button>
    </div>
  )}
      <table className={styles["meeting-table"]}>
        <thead>
          <tr>
          {role === "teacher" && <th>From</th>}
          {role === "student" && <th>Teacher</th>}
            <th>Content of Meeting</th>
            <th>Type of Meeting</th>
            <th>Time</th>
            <th>Address</th>
            {role === "teacher" && <th>Action</th>}
            {role === "student" && <th>Edit</th>}
          </tr>
        </thead>
        <tbody>
          {meetings.length === 0 ? (
            <tr>
              <td colSpan="6">No meeting is available.</td>
            </tr>
          ) : (
            meetings.map((meeting) => (
              <tr key={meeting._id}>
                {role === "student"&&<td>{meeting.teacherId.Fullname}</td>}
                {role === "teacher"&&<td>{meeting.studentId.Fullname}</td>}
                <td>{meeting.reason}</td>
                <td>{meeting.meetingType}</td>
                <td>{new Date(meeting.time).toLocaleString()}</td>
                <td>  {meeting.meetingType === "online"? meeting.meetingUrl : meeting.address || "N/A"}</td>
                {role === "teacher" && (
                  <td>
                    {meeting.status === "Pending" ? (
                      <>
                        <button className={styles["btn accept"]} onClick={() => handleConfirm(meeting._id)}>
                          Accept
                        </button>
                        {rejectedMeetingId === meeting._id ? (
                          <div>
                            <input
                              type="text"
                              placeholder="Nhập lý do từ chối"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <button onClick={() => handleReject(meeting._id,rejectionReason)}>
                              Reject
                            </button>
                            <button onClick={() => setRejectedMeetingId(null)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button className={styles["btn reject"]} onClick={() => handleStartReject(meeting._id)}>
                            Reject
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {meeting.status === "Accepted" && <span>Accepted</span>}
                        {meeting.status === "Rejected" && <span>Rejected</span>}
                      </>
                    )}
                  </td>
                )}
                {role === "student" && (
                  <td>
                    {meeting.status === "Pending" && (
                      <button className={styles["btn edit"]} onClick={() => handleEdit(meeting)}>Edit</button>
                    )}
                    {meeting.status !== "Pending" && <span>Done</span>}
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