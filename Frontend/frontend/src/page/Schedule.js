import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { DatePicker, notification } from "antd";
import { SmileOutlined } from "@ant-design/icons";
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
  const [selectedWeek, setSelectedWeek] = useState(moment());
  const [notifData, setNotifData] = useState(null);
  const token = localStorage.getItem("accessToken");
  const smileIcon = <SmileOutlined />;
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (notifData) {
      api.open({
        message: notifData.type === "success" ? "Tải lịch thành công!" : "Tải lịch thất bại!",
        description:
          notifData.detailMessage ||
          (notifData.type === "success"
            ? "Lịch của bạn đã được tải thành công."
            : ""),
        showProgress: true,
        pauseOnHover: true,
      });
      setNotifData(null);
    }
  }, [notifData, api]);
  console.log(schedules);
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/schedule/get-schedule-by-user",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSchedules(res.data.schedules);
        setLoading(false);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Có lỗi xảy ra!";
        setNotifData({ type: "error", detailMessage: errorMessage });
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

  const getScheduleForCell = (weekDate, slot) => {
    return schedules.filter((item) => {
      const itemDate = moment(item.Day);
      return itemDate.isSame(weekDate, "day") && item.Slot === slot.slot;
    });
  };

  const onWeekChange = (date) => {
    if (date) {
      const selectedDate = moment(date.toDate());
      const startOfWeek = selectedDate.startOf("isoWeek");
      setSelectedWeek(startOfWeek);
    }
  };

const handleAttendance = async (scheduleId) => {
  try {
    await axios.get(
      `http://localhost:8000/attendance/get-attendance-by-schedule/${scheduleId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
      window.location.href = `/attendance/${scheduleId}`;
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Có lỗi xảy ra!";
    setNotifData({ type: "error", detailMessage: errorMessage });
  }
};


  if (loading) return <div>Đang tải lịch học...</div>;

  return (
    <div>
      {contextHolder}
      <Header />
      <div className={styles.scheduleContainer}>
        <h1 className={styles.title}>Lịch học của tuần</h1>
        <div className={styles.datePicker}></div>
        <div className={styles.tableContainer}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>
                  <DatePicker
                    picker="week"
                    suffixIcon={smileIcon}
                    onChange={onWeekChange}
                    value={selectedWeek}
                    style={{ borderColor: "#ccc", borderRadius: "5px" }}
                  />
                </th>
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
                            <div
                              key={sch._id}
                              className={styles.scheduleItem}
                              onClick={() => handleAttendance(sch._id)}
                            >
                              <strong>Subject: {sch.Class.Subject.Name}</strong>
                              <div>
                                Class: {sch.Class.Classname} <br />
                                Teacher: {sch.Class.Teacher.Fullname}
                                <br />
                                Room: {sch.Address}
                                <br />
                                Status: {sch.Attendances[0].IsPresent}
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
