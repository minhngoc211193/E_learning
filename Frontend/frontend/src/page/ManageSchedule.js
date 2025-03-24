import React, { useState, useEffect, useCallback } from 'react';
import styles from "./ManageSchedule.module.css";
import { DatePicker, Space, notification } from 'antd';
import axios from 'axios';
import moment from 'moment';
import Menu from '../components/Menu';

function ManageSchedule() {
  const [displayDay, setDisplayDay] = useState(moment());
  const [schedules, setSchedules] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const token = localStorage.getItem("accessToken");

  const openNotification = (type, detailMessage = "", pauseOnHover = true) => {
    if (type === "success") {
      api.open({
        message: 'Tạo lịch học thành công!',
        description: 'Lịch học của bạn đã được tạo thành công.',
        showProgress: true,
        pauseOnHover,
      });
    } else {
      api.open({
        message: 'Tạo lịch học thất bại!',
        description: detailMessage,
        showProgress: true,
        pauseOnHover,
      });
    }
  };

  // Sử dụng useCallback để định nghĩa fetchSchedules
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
  const timeSlots = ["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5"];

  // Hàm lọc lịch học theo phòng và slot
  const getScheduleForCell = (room, slot) => {
    return schedules.filter((schedule) => schedule.Address === room && schedule.Slot === slot);
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/schedule/create-schedule",
        {
          ClassId: selectedClass,
          Address: selectedRoom,
          Slot: selectedSlot,
          Day: selectedDay ? selectedDay.format("YYYY-MM-DD") : ""
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      openNotification("success", "", true);

      // Reset form
      setSelectedClass("");
      setSelectedSlot("");
      setSelectedRoom("");
      setSelectedDay(null);

      fetchSchedules(displayDay);
    } catch (err) {
      console.error("Lỗi khi tạo lịch học:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || "Có lỗi xảy ra!";
      openNotification("error", errorMessage, true);
    }
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
                <tr key={slot}>
                  <td>{slot}</td>
                  {rooms.map((room) => {
                    const cellSchedules = getScheduleForCell(room, slot);
                    return (
                      <td key={room} className={styles.scheduleCell}>
                        {cellSchedules.length > 0 ? (
                          cellSchedules.map((sch) => (
                            <div key={sch._id} className={styles.scheduleItem}>
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
          <form onSubmit={handleCreateSchedule} className={styles.createSchedule}>
            <h2 className={styles.headingMain}>Create schedule</h2>

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

            <button type="submit" className={styles.btnCreate}>
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManageSchedule;
