import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Menu from '../components/Menu';

function ManageMeeting (){
    const [meetings, setMeetings] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMeeting, setCurruntMeeting] = useState(null);
    const [editedMeeting, setEditedMeeting] = useState({});
    const [rejectedMeetingId, setRejectedMeetingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
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


    const handleConfirm = async (meetingId) =>{
        const decoded = jwtDecode(token);
        const role = decoded.Role;

        if(role !=="teacher"){
            alert(" Just teacher can confirm meetings");
            return;
        }
        try {
            const response = await axios.post("http://localhost:8000/meet/respond-meeting",{
                meetingId, action: "accept"},
                {
                    headers: {Authorization: `Bearer ${token}`}
                }
            );
            console.log("Meeting confirmed response: ", response);
            alert("Meeting was accepted!");
            fetchMeetings();
        }catch(e){
            console.error("Error confirm meeting: ", e);

        }
    };
    const handleStartReject = (meetingId) => {
      setRejectedMeetingId(meetingId);
      setRejectionReason("");  // reset lý do cũ
    };
    const handleReject = async (meetingId, rejectionReason) =>{

        if(!rejectionReason || rejectionReason.trim() ===""){
          alert("Vui lòng nhập lý do từ chối.");
          return;
        }
        try{
          const decoded = jwtDecode(token);
          const role = decoded.Role;
          if(role!=="teacher"){
              alert("Just teacher can reject meeting!");
              return;
          }
            const response = await axios.post("http://localhost:8000/meet/respond-meeting", 
                {
                meetingId, action: "reject", rejectionReason
                },
                {headers: {Authorization: `Bearer ${token}`}}
        );
        console.log("Meeting rejected response: ", response);
            alert ("Meeting was rejected!");
            setRejectedMeetingId(null);
            setRejectionReason("");
            // reload data
            fetchMeetings();
        } catch(e){
            console.error("Error rejectng meeting", e);
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
          {role === "teacher" && <th>From</th>}
          {role === "student" && <th>Teacher</th>}
            <th>Content of Meeting</th>
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
                        <button onClick={() => handleConfirm(meeting._id)}>
                          Chấp nhận
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
                              Xác nhận từ chối
                            </button>
                            <button onClick={() => setRejectedMeetingId(null)}>
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleStartReject(meeting._id)}>
                            Từ chối
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {meeting.status === "Accepted" && <span>Đã xác nhận</span>}
                        {meeting.status === "Rejected" && <span>Đã từ chối</span>}
                      </>
                    )}
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