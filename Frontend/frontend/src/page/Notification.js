import { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client"; // ✅ Import socket.io-client

const socket = io("http://localhost:8000"); // 🔄 Kết nối với server socket

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchNotifications();

    // Lắng nghe sự kiện socket khi có thông báo mới
    socket.on("receive notification", (newNotification) => {
      console.log("📩 Nhận thông báo mới:", newNotification);
      setNotifications((prev) => [newNotification, ...prev]); // ✅ Thêm thông báo mới vào đầu danh sách
    });

    return () => {
      socket.off("receive notification"); // Cleanup khi component unmount
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:8000/notification/noti", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 401) navigate("/login");
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
