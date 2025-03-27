// src/Socket.js

import { io } from "socket.io-client";

// Tạo một hàm để khởi tạo kết nối Socket.IO
function createSocket () {
  // Kết nối đến server, thay đổi URL nếu cần
  const socket = io("http://localhost:8000"); // URL của server

  // Bạn có thể thêm các sự kiện ở đây nếu cần
  socket.on("connect", () => {
    console.log("Đã kết nối tới server với id: ", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Đã ngắt kết nối khỏi server");
  });

  return socket;
};
export default createSocket;
