import { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client"; // ✅ Import socket.io-client
import createSocket from "./Socket";
import {jwtDecode} from 'jwt-decode';


 // 🔄 Kết nối với server socket

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const decoded = jwtDecode(token);
  const userId = decoded.id;
  const socket = createSocket();

  useEffect(() => {
    if (userId) {
      socket.emit('register', userId);
    }
    fetchNotifications();

    // Lắng nghe sự kiện socket khi có thông báo mới
    socket.on("receive notification", (newNotification) => {
      console.log("📩 Nhận thông báo mới:", newNotification);
      setNotifications((prevNotifications) => {
        return [newNotification, ...prevNotifications];  // Thêm thông báo mới vào đầu danh sách
      });
    });
    socket.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        socket.emit('register', userId);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    return () => {
      socket.off("receive notification");
      socket.off('connect');
      socket.off('connect_error');
    };
  }, [userId]);

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

  return (
    <div className="w-96 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Bell className="w-5 h-5 text-yellow-500" /> Thông báo
      </h2>
      <div className="mt-4 space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification._id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <p className="font-medium">{notification.message}</p>
                <p className="text-sm text-gray-500">Từ: {notification.sender?.Fullname}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Không có thông báo nào</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
