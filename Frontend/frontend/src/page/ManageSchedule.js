import React, { useState, useEffect, useCallback } from 'react';
import styles from "./ManageSchedule.module.css";
import { DatePicker, Space, notification, Spin } from 'antd';
import axios from 'axios';
import moment from 'moment';
import Menu from '../components/Menu';
import Swal from 'sweetalert2';

function ManageSchedule() {
  const [displayDay, setDisplayDay] = useState(moment());
  const [schedules, setSchedules] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const token = localStorage.getItem("accessToken");

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

  // Hàm fetchSchedules được định nghĩa với useCallback
  const fetchSchedules = useCallback(async (date) => {
    try {
      const res = await axios.get("http://localhost:8000/schedule/get-schedule-by-day", {
        params: { day: date.format("YYYY-MM-DD") },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedules(res.data);
    } catch (err) {
      console.error("Error fetching schedules", err);
      setSchedules([]);
    }
  }, [token]);

  // Lấy danh sách lớp học
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get("http://localhost:8000/class/classes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClasses(res.data);
      } catch (error) {
        console.error("Error fetching classes", error);
      }
    };

    fetchClasses();
  }, [token]);

  // Lấy lịch học theo ngày hiển thị
  useEffect(() => {
    if (displayDay) {
      fetchSchedules(displayDay);
    }
  }, [displayDay, fetchSchedules]);

  // Các phòng và slot cố định cho bảng quản lí
  const rooms = ["G401", "G402", "G403", "G404"];
  const timeSlots = [
    { slot: "Slot 1", Time: "08:00 - 9:30" },
    { slot: "Slot 2", Time: "9:40 - 11:10" },
    { slot: "Slot 3", Time: "13:00 - 14:30" },
    { slot: "Slot 4", Time: "14:40 - 16:10" },
    { slot: "Slot 5", Time: "16:20 - 17:50" },
  ];

  // Hàm lọc lịch học theo phòng và slot
  const getScheduleForCell = (room, slot) => {
    return schedules.filter((schedule) => schedule.Address === room && schedule.Slot === slot);
  };

  // Khi click vào một lịch học ở bảng, chuyển sang chế độ chỉnh sửa
  const handleSelectSchedule = (sch) => {
    if (editingSchedule && editingSchedule._id === sch._id) {
      setEditingSchedule(null);
      setSelectedClass("");
      setSelectedRoom("");
      setSelectedSlot("");
      setSelectedDay(null);
    } else {
      setEditingSchedule(sch);
      setSelectedClass(sch.Class?._id || "");
      setSelectedRoom(sch.Address);
      setSelectedSlot(sch.Slot);
      setSelectedDay(moment(sch.Day));
    }
  };

  // Xử lý tạo mới hoặc cập nhật lịch học dựa trên editingSchedule
  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedRoom || !selectedSlot || !selectedDay) {
      openNotification("error", "Plase fill in all fields!");
      return;
    }
    setLoading(true);
    try {
      if (editingSchedule) {
        // Update lịch học
        await axios.put(
          `http://localhost:8000/schedule/update-schedule/${editingSchedule._id}`,
          {
            ClassId: selectedClass,
            Address: selectedRoom,
            Slot: selectedSlot,
            Day: selectedDay.format("YYYY-MM-DD")
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        openNotification("success", "Update schedule successful!", true);
      } else {
        // Tạo lịch học mới
        await axios.post(
          "http://localhost:8000/schedule/create-schedule",
          {
            ClassId: selectedClass,
            Address: selectedRoom,
            Slot: selectedSlot,
            Day: selectedDay.format("YYYY-MM-DD")
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        openNotification("success", "Create schedule successful!", true);
      }

      // Reset form sau khi submit
      setEditingSchedule(null);
      setSelectedClass("");
      setSelectedSlot("");
      setSelectedRoom("");
      setSelectedDay(null);
      // Reload lịch học cho ngày hiện tại
      fetchSchedules(displayDay);
    } catch (err) {
      console.error("Error when process schedule:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || "Have problem!";
      openNotification("error", errorMessage, true);
    }
    setLoading(false);
  };

  // Xử lý xóa lịch học với xác nhận SweetAlert2
  const handleDeleteSchedule = async () => {
    const result = await Swal.fire({
      title: "Do you want to delete this schedule?",
      text: "Action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8000/schedule/delete-schedule/${editingSchedule._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Delete!", "Schedule has been delete.", "success");
      setEditingSchedule(null);
      setSelectedClass("");
      setSelectedSlot("");
      setSelectedRoom("");
      setSelectedDay(null);
      fetchSchedules(displayDay);
    } catch (error) {
      console.error("Error when delete schedule", error);
      Swal.fire("Error!", "Cannot delete schedule.", "error");
    }
    setLoading(false);
  };

  return (
    <div className={styles.body}>
      <Menu />
      <div className={styles.container}>
        {contextHolder}
        <h1 className={styles.heading}>Schedule all class</h1>
        <div className={styles.tableScheduleAll}>
          <div className={styles.date}>
            <Space direction="vertical">
              <DatePicker
                className={styles.datePicker}
                value={displayDay}
                onChange={(date) => setDisplayDay(date)}
                format="YYYY-MM-DD"
              />
            </Space>
          </div>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>
                  <p className={styles.room}>Room</p>
                  <p className={styles.slot}>Slot</p>
                </th>
                {rooms.map((room) => (
                  <th key={room}>{room}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.slot}>
                  <td>
                    <div>
                      <strong>{slot.slot}</strong>
                    </div>
                    <div>
                      {slot.Time}
                    </div>
                  </td>
                  {rooms.map((room) => {
                    const cellSchedules = getScheduleForCell(room, slot.slot);
                    return (
                      <td key={room} className={styles.scheduleCell}>
                        {cellSchedules.length > 0 ? (
                          cellSchedules.map((sch) => (
                            <div
                              key={sch._id}
                              className={`${styles.scheduleItem} ${editingSchedule && editingSchedule._id === sch._id ? styles.activeSchedule : ""
                                }`}
                              onClick={() => handleSelectSchedule(sch)}
                            >
                              <h2 className={styles.subjectName}>Subject: {sch.Class?.Subject?.Name}</h2>
                              <p className={styles.scheduleInfo}>
                                Class: {sch.Class?.Classname} <br />
                                Teacher: {sch.Class?.Teacher?.Fullname}
                              </p>
                            </div>
                          ))
                        ) : (
                          <span>&nbsp;</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.main}>
          <form onSubmit={handleSubmitSchedule} className={styles.createSchedule}>
            <h2 className={styles.headingMain}>
              {editingSchedule ? "Edit schedule" : "Create schedule"}
            </h2>

            <div className={styles.createScheduleLeft}>
              {/* Chọn lớp */}
              <select
                className={styles.selectClass}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.Classname} - {cls.Teacher?.Fullname}
                  </option>
                ))}
              </select>
              <br />

              {/* Chọn Slot */}
              <select
                className={styles.selectSlot}
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                <option value="">Select a slot</option>
                <option value="Slot 1">Slot 1</option>
                <option value="Slot 2">Slot 2</option>
                <option value="Slot 3">Slot 3</option>
                <option value="Slot 4">Slot 4</option>
                <option value="Slot 5">Slot 5</option>
              </select>
            </div>

            <div className={styles.createScheduleRight}>
              {/* Chọn phòng học */}
              <select
                className={styles.selectRoom}
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="">Select a room</option>
                <option value="G401">G401</option>
                <option value="G402">G402</option>
                <option value="G403">G403</option>
                <option value="G404">G404</option>
              </select>
              <br />

              {/* Chọn ngày */}
              <DatePicker
                className={styles.datePicker}
                value={selectedDay}
                onChange={(date) => setSelectedDay(date)}
                format="YYYY-MM-DD"
              />
            </div>

            <button type="submit" className={styles.btnCreate} disabled={loading}>
              {loading ? <Spin size="small" /> : (editingSchedule ? "Save" : "Create")}
            </button>
            {editingSchedule && (
              <button
                type="button"
                className={styles.btnDelete}
                onClick={handleDeleteSchedule}
                disabled={loading}
              >
                {loading ? <Spin size="small" /> : "Delete"}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManageSchedule;
