import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { FaPaperPlane, FaUserCircle } from "react-icons/fa";
import {jwtDecode }from "jwt-decode";
import CreateMeet from "./CreateMeet";
import createSocket  from "./Socket";


function Messenger () {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isMeetingFormVisible, setIsMeetingFormVisible] = useState(false);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    // Khởi tạo kết nối Socket.IO
    const newSocket = createSocket();
    setSocket(newSocket);

    // Cleanup khi component unmount
    return () => {
      newSocket.disconnect();
      console.log("Disconnected from server in cleanup");
    };
  }, []);

  // Lấy danh sách hội thoại
  useEffect(() => {
    if(token){
        fetchConversations();
    }
  }, [token]);

  const fetchConversations = async () => {
    try {
      // Giải mã token để lấy thông tin người dùng
      const decoded = jwtDecode(token);
      const userId = decoded.id; // Lấy userId từ token
      const role = decoded.Role;  // Lấy role (student, teacher)
  
      // Cập nhật role người dùng
      setUserRole(role);
  
      // Kiểm tra quyền truy cập
      if (role !== "student" && role !== "teacher") {
        alert("Bạn không được quyền truy cập");
        navigate("/home");
        return;
      }
  
      // Gửi yêu cầu lấy hội thoại của người dùng hiện tại
      const res = await axios.get("http://localhost:8000/messenger/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', 
        },
      });
  
      console.log("API Response:", res.data);
      // Cập nhật danh sách hội thoại
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error("Lỗi khi lấy hội thoại:", error);
    }
  };
  
  // Lấy tin nhắn của hội thoại đã chọn
  useEffect(() => {
    if (!selectedConversation) return;
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/messenger/history?conversationId=${selectedConversation._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.messages.reverse());
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation, token]);

  useEffect(() => {
    if (!socket) return;
  
    socket.on("newMessage", (msg) => {
      // Kiểm tra xem tin nhắn có thuộc về hội thoại đã chọn không
      if (selectedConversation && 
          (msg.senderId === selectedConversation.teacherId || 
           msg.senderId === selectedConversation.studentId)) {
        setMessages((prev) => [...prev, msg]); // Thêm tin nhắn mới vào danh sách
      }
    });
  
  }, [socket, selectedConversation]);

  // Gửi tin nhắn
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post("http://localhost:8000/messenger/send",
        {
          receiverId: selectedConversation.teacherId || selectedConversation.studentId,
          text: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data.newMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Danh sách hội thoại */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <h2 className="p-4 text-lg font-bold border-b">Hội thoại</h2>
        {conversations.map((conv) => (
          <div
            key={conv._id}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-200 ${
              selectedConversation?._id === conv._id ? "bg-gray-300" : ""
            }`}
            onClick={() => setSelectedConversation(conv)}
          >
            <FaUserCircle className="text-2xl text-gray-500 mr-3" />
            <span>{conv.teacherId?.Fullname || conv.studentId?.Fullname}</span>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b flex items-center">
              <FaUserCircle className="text-3xl text-gray-500 mr-3" />
              <h2 className="text-lg font-bold">
                {selectedConversation.teacherId?.Fullname || selectedConversation.studentId?.Fullname}
              </h2>
            </div>

            {/* Message List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`p-2 rounded-md ${
                            // Kiểm tra senderId để phân biệt tin nhắn gửi đi và nhận được
                            msg.senderId === jwtDecode(token).id ? "bg-blue-500 text-white self-end" : "bg-gray-200 self-start"
                        }`}
                    >
                        {/* Hiển thị tin nhắn */}
                        <div>{msg.text}</div>

                        {/* Hiển thị receiveId   */}
                        <div className="text-xs text-gray-500 mt-1">{msg.receiveId}</div>
                    </div>
                ))}
            </div>
            {/* Input Box */}
            <div className="p-4 bg-white border-t flex">
              <input
                type="text"
                className="flex-1 p-2 border rounded-md"
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="ml-2 bg-blue-500 text-white p-2 rounded-md" onClick={sendMessage}>
                <FaPaperPlane />
              </button>
            </div>
            {/* Nút Tạo cuộc họp */}
            {userRole === "student" && (
              <button
                onClick={() => setIsMeetingFormVisible(true)}
                className="ml-2 bg-green-500 text-white p-2 rounded-md mt-4"
              >
                Tạo cuộc họp
              </button>
            )}

            {/* Hiển thị form tạo cuộc họp nếu cần */}
            {isMeetingFormVisible && (
              <CreateMeet
                selectedConversation={selectedConversation}
                token={token}
                onClose={() => setIsMeetingFormVisible(false)}
              />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500">
            Chọn hội thoại để bắt đầu chat
          </div>
        )}
      </div>

    </div>
  );
};

export default Messenger;
