import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ManageMeeting (){
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
    useEffect(() => {
        if(token){
            fetchMeetings();
        }
    }, [token]);

    const fetchMeetings = async()=>{
        const decoded = jwtDecode(token);
        const userId = decoded.id; 
        const role = decoded.Role;
        setUserRole(role);
        try{
            let response;
            if(role ==="student"){
                response = await axios.get("http://localhost:8000/meet/meetings", {
                    headers: { Authorization: `Bearer ${token}`}
                });
            }else if (role === "teacher"){
                response = await axios.get("http://localhost:8000/meet/meetings", {
                    headers: { Authorization: `Bearer ${token}`}
                }); 
            }
            console.log("Lich meeting: ", response.data.meetings);
            setMeetings(response.data.meetings);
        }catch(error){
            console.error("Error fetching meetings: ", error);
        }
    };

    const handleRespond = async (meetingId, action, rejectionReason = "") =>{
        const decoded = jwtDecode(token);
        const role = decoded.Role;
        if(role!=="teacher"){
            alert("Just teacher can reject meeting!");
            return;
        }
        if(action !== "accept" && action !== "reject"){
          alert ("Not available activity");
          return;
        }
        try{
            const response = await axios.post("http://localhost:8000/meet/respond-meeting", 
                {
                meetingId, action, rejectionReason: action === "reject" ? rejectionReason : undefined,
                },
                {headers: {Authorization: `Bearer ${token}`}}
        );
        console.log("Response data from server:", response.data);
        console.log(`Meeting ${action === "accept" ? "confirmed" : "rejected"} response: `, response);
        if(action ==="reject"){
            alert ("Meeting was rejected!");
        }else if (action ==="accept"){
          if (response.data.meetingUrl) {
            alert(`Meeting was accepted! Join the meeting at: ${response.data.meetingUrl}`);
          } else {
            alert("Meeting was accepted! It's an offline meeting.");
          }
        }
        fetchMeetings();
        } catch(e){
          console.error(`Error ${action === "accept" ? "confirming" : "rejecting"} meeting: `, e);
        }
    };

    const handleEdit = (meeting) =>{
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
    return(
        <div className="meeting-list">
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
                        <button onClick={() => handleRespond(meeting._id, "accept")}>Chấp nhận</button>
                        <button onClick={() => handleRespond(meeting._id, "reject")}>Từ chối</button>
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