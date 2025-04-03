import { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client"; // ✅ Import socket.io-client
import createSocket from "./Socket";
import {jwtDecode} from 'jwt-decode';
import styles from './Notification.module.css';


 // 🔄 Kết nối với server socket

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const decoded = jwtDecode(token);
  const userId = decoded.id;

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:8000/notification/noti", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 401) navigate("/");
    }
  };

  useEffect(() => {
    if (!userId) return;

    const newSocket = createSocket();  // ✅ Chỉ tạo socket một lần
    setSocket(newSocket);

    newSocket.emit("register", userId);  // Đăng ký user với socket server
    fetchNotifications();  // Lấy danh sách thông báo ban đầu

    newSocket.on("receive notification", (newNotification) => {
      console.log("📩 Nhận thông báo mới:", newNotification);
      setNotifications((prev) => [newNotification, ...prev]);
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected");
      newSocket.emit("register", userId);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    return () => {
      newSocket.off("receive notification");
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.disconnect();  // ✅ Ngắt kết nối khi unmount
    };
  }, [userId]);


  return (
    <div className={styles["notification-container"]}>
      <h2 className={styles["notification-header"]}>
        <Bell className={styles["notification-icon"]} /> Thông báo
      </h2>
      <div className={styles["notification-list"]}>
        {notifications.length > 0 ? (
          notifications.slice(0, 4).map((notification) => (
            <div key={notification._id} className={styles["notification-item"]}>
              <div>
                <p className={styles["notification-message"]}>{notification.message}</p>
                <p className={styles["notification-sender"]}>Từ: {notification.sender?.Fullname}</p>
              </div>
            </div>
          ))
        ) : (
          <p className={styles["no-notifications"]}>Không có thông báo nào</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
