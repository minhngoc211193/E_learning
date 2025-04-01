import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Attendance.module.css";
import { useParams } from "react-router-dom";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";

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
        message: 'Thành công!',
        description: detailMessage,
        showProgress: true,
        pauseOnHover,
      });
    } else {
      api.open({
        message: 'Thất bại!',
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
      } catch (err) {
        setError("Không thể lấy dữ liệu điểm danh.");
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
        isPresent: record.IsPresent  || "absent",
        comment: record.Comment || "",
      }));
      await axios.put(
        "http://localhost:8000/attendance/update-attendance",
        { scheduleId, students: updatedAttendance },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      openNotification("success", "Cập nhật điểm danh thành công!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Có lỗi xảy ra!";
      openNotification("error", errorMessage, true);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {contextHolder}
      <div className={styles.container}>
        <div className={styles.backButton} onClick={() => navigate("/schedule")}>
          <span><i className="fa-solid fa-arrow-left"></i></span>
        </div>
        <h1 className={styles.header}>Danh sách điểm danh lớp:</h1>
        <h3 className={styles.header}>Ngày: </h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Họ và Tên</th>
                <th>User name</th>
                <th>Trạng thái</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr key={record.Student._id}>
                  <td>
                    <img
                      src={record.Student.Image}
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
                    <input type="text" value={record.Comment || ""} onChange={(e) => {
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
