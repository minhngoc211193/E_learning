import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Attendance.module.css";
import { useParams } from "react-router-dom";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import ProfileImg from "../assets/profile.jpg";

function Attendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("accessToken");
  const [api, contextHolder] = notification.useNotification();
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  const openNotification = (type, detailMessage = "", pauseOnHover = true) => {
    if (type === "success") {
      api.open({
        message: 'Success!',
        description: detailMessage,
        showProgress: true,
        pauseOnHover,
      });
    } else {
      api.open({
        message: 'Failed!',
        description: detailMessage,
        showProgress: true,
        pauseOnHover,
      });
    }
  };
  // Lấy danh sách điểm danh từ API
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/attendance/get-attendance-by-schedule/${scheduleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttendanceData(response.data.usersWithImage);
        console.log(response.data.usersWithImage);
      } catch (err) {
        setError("Cannot got attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [scheduleId, token]);

  // Hàm cập nhật trạng thái điểm danh trong state
  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prevData) =>
      prevData.map((record) =>
        record.Student._id === studentId ? { ...record, IsPresent: status } : record
      )
    );
  };

  // Hàm xử lý gửi dữ liệu điểm danh lên server
  const handleSubmit = async () => {
    try {
      const updatedAttendance = attendanceData.map((record) => ({
        studentId: record.Student._id,
        isPresent: record.IsPresent === "pending" ? "absent" : record.IsPresent,
        comment: record.Comment || "",
      }));
      await axios.put(
        "http://localhost:8000/attendance/update-attendance",
        { scheduleId, students: updatedAttendance },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      openNotification("success", "Update attendance successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Have problem!";
      openNotification("error", errorMessage, true);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {contextHolder}
      <div className={styles.container}>
        <div className={styles.backButton} onClick={() => navigate("/schedule")}>
          <span><i className="fa-solid fa-arrow-left"></i></span>
        </div>
        <h1 className={styles.header}>Danh sách điểm danh</h1>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Fullname</th>
                <th>User name</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr key={record.Student._id}>
                  <td>
                    <img
                      src={record.Student.Image || ProfileImg}
                      alt="avatar"
                      className={styles.avatar}
                    />
                  </td>
                  <td>{record.Student.Fullname}</td>
                  <td>{record.Student.Username}</td>
                  <td>
                    <div className={styles.status}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name={`status-${record.Student._id}`}
                          value="absent"
                          checked={record.IsPresent === "absent"}
                          onChange={() => handleStatusChange(record.Student._id, "absent")}
                        />
                        Absent
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name={`status-${record.Student._id}`}
                          value="attended"
                          checked={record.IsPresent === "attended"}
                          onChange={() => handleStatusChange(record.Student._id, "attended")}
                        />
                        Attendance
                      </label>
                    </div>
                  </td>
                  <td>
                    <input className={styles.comment} type="text" value={record.Comment || ""} onChange={(e) => {
                      const updatedData = attendanceData.map((data) =>
                        data.Student._id === record.Student._id
                          ? { ...data, Comment: e.target.value }
                          : data
                      );
                      setAttendanceData(updatedData);
                    }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.saveButton} onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
