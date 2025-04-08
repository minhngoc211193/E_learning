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
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const decoded = jwtDecode(token);
  const userId = decoded.id;
  const socket = createSocket();

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
    if (userId) {
      socket.emit('register', userId);  // Đảm bảo socket đã đăng ký với đúng userId
    }
    
    fetchNotifications();  // Lấy thông báo ban đầu
  
    // Lắng nghe sự kiện 'receive notification'
    socket.on("receive notification", (newNotification) => {
      console.log("📩 Nhận thông báo mới:", newNotification);
      setNotifications((prevNotifications) => {
        return [newNotification, ...prevNotifications];  // Thêm thông báo mới vào đầu danh sách
      });
    });
  
    // Lắng nghe sự kiện 'connect' để đảm bảo socket luôn kết nối
    socket.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        socket.emit('register', userId);  // Đảm bảo đăng ký lại nếu socket mất kết nối
      }
    });
  
    // Lắng nghe sự kiện 'connect_error' nếu có lỗi khi kết nối
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  
    return () => {
      socket.off("receive notification");
      socket.off('connect');
      socket.off('connect_error');
    };
  }, [socket,fetchNotifications,userId]);


  return (
    <div className={styles["notification-container"]}>
      <h2 className={styles["notification-header"]}>
        <Bell className={styles["notification-icon"]} /> Thông báo
      </h2>
      <div className={styles["notification-list"]}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
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
