import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment"; // npm install moment
import { DatePicker } from "antd";
import { SmileOutlined } from '@ant-design/icons';
import styles from "./Schedule.module.css";
import Header from "../components/Header";

function Schedule() {
  const timeSlots = [
    { slot: "Slot 1" },
    { slot: "Slot 2" },
    { slot: "Slot 3" },
    { slot: "Slot 4" },
    { slot: "Slot 5" },
  ];

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(moment());
  const smileIcon = <SmileOutlined />;
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/schedule/get-schedule-by-user",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSchedules(res.data.schedules);
        setLoading(false);
        console.log(res.data.schedules);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Có lỗi khi tải lịch học");
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [token]);

  // Hàm tính toán 7 ngày trong tuần dựa trên selectedWeek
  const getWeekDays = () => {
    const startOfWeek = moment(selectedWeek).startOf("isoWeek");
    return Array.from({ length: 7 }, (_, i) =>
      moment(startOfWeek).add(i, "days")
    );
  };

  const weekDays = getWeekDays();

  // Hàm lọc lịch học theo ngày và khung giờ
  // Giả sử mỗi schedule có thuộc tính date (ISO string) và slot
  const getScheduleForCell = (weekDate, slot) => {
    return schedules.filter((item) => {
      const itemDate = moment(item.Day); // Chuyển đổi ngày từ database
      return itemDate.isSame(weekDate, "day") && item.Slot === slot.slot;
    });
  };


  // Xử lý khi người dùng thay đổi tuần trên DatePicker
  const onWeekChange = (date) => {
    if (date) {
      // Đưa về đầu tuần (thứ Hai)
      const selectedDate = moment(date.toDate()); // Chuyển đổi về JavaScript Date trước khi dùng moment
      const startOfWeek = selectedDate.startOf("isoWeek"); // Lấy ngày đầu tuần chính xác
      setSelectedWeek(startOfWeek);
    }
  };

  if (loading) return <div>Đang tải lịch học...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Header />
      <div className={styles.scheduleContainer}>
        <h1 className={styles.title}>Lịch học của tuần</h1>
        <div className={styles.datePicker}>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>
                  <DatePicker
                    picker="week" suffixIcon={smileIcon}
                    onChange={onWeekChange}
                    value={selectedWeek}
                    style={{ borderColor: '#ccc', borderRadius: '5px' }}
                  /></th>
                {weekDays.map((day, index) => (
                  <th key={index}>
                    <div>{day.format("dddd")}</div>
                    <div>{day.format("DD/MM/YYYY")}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slotItem, idx) => (
                <tr key={idx}>
                  <td className={styles.timeSlot}>
                    <div className={styles.slotLabel}>{slotItem.slot}</div>
                  </td>
                  {weekDays.map((day, index) => {
                    const cellSchedules = getScheduleForCell(day, slotItem);
                    return (
                      <td key={index} className={styles.scheduleCell}>
                        {cellSchedules.length > 0 ? (
                          cellSchedules.map((sch) => (
                            <div key={sch._id} className={styles.scheduleItem}>
                              <strong>Subject: {sch.Class.Subject.Name}</strong>
                              <div>
                                Class: {sch.Class.Classname} <br />
                                Teacher: {sch.Class.Teacher.Fullname}<br />
                                Room: {sch.Address}
                              </div>
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
      </div>
    </div>
  );
}

export default Schedule;
