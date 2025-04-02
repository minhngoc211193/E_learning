import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPaperPlane, FaUserCircle } from "react-icons/fa";
import {jwtDecode} from "jwt-decode";
import CreateMeet from "./CreateMeet";
import createSocket from "./Socket";
import styles from "./Messenger.module.css";

function Messenger() {
  const messagesEndRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isMeetingFormVisible, setIsMeetingFormVisible] = useState(false);
  const token = localStorage.getItem("accessToken");
  const decoded = jwtDecode(token);
  const role = decoded.Role;
  const userId = decoded.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    // Khởi tạo kết nối Socket.IO
    const newSocket = createSocket();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      console.log("Disconnected from server in cleanup");
    };
  }, [token, navigate]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Lấy danh sách hội thoại
  useEffect(() => {
    if (token) {
      fetchConversations();

    }
  }, [token]);
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    const token = localStorage.getItem("accessToken");

    try {
        const response = await axios.get("http://localhost:8000/messenger/search", {
            params: { searchText: searchText.trim() }, // Sử dụng params để match với req.query ở backend
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        setSearchResults(response.data);
    } catch (e) {
        console.error('Error searching and creating conversation:', e);
        // Xử lý trường hợp không tìm thấy người dùng hoặc lỗi khác
        if (e.response && e.response.status === 404) {
            setSearchResults([]); // Đặt mảng rỗng nếu không tìm thấy người dùng
        }
    }
};
useEffect(() => {
  if (selectedConversationId) {
    console.log("Selected Conversation ID in Messenger:", selectedConversationId);
    fetchMessages(selectedConversationId); // Fetch messages khi ID thay đổi

    if (socket) {
      socket.emit("join chat", selectedConversationId); // Emit "join chat" khi ID thay đổi
    }
  }
}, [selectedConversationId, socket]); // Chạy effect khi selectedConversationId hoặc socket thay đổi

const handleUser = async(user) =>{
  try{
    const response = await axios.post("http://localhost:8000/messenger/create", 
      {
        searchUserId: user._id, // Sửa lại để match với backend
      },{
        headers: {Authorization: `Bearer ${token}`},
      });
      
      // Nếu có conversation trả về, set conversation đó
      setSelectedConversationId(response.data._id);
      
      // Nếu là conversation mới, fetch messages
      fetchMessages(response.data._id);
  }catch(e){
    console.error("Error creating conversation:", e)
    // Xử lý các loại lỗi khác nhau nếu cần
    if (e.response) {
      switch(e.response.status) {
        case 404:
          alert("Người dùng không tồn tại");
          break;
        case 403:
          alert("Bạn không thể tạo cuộc trò chuyện với người dùng này");
          break;
        default:
          alert("Có lỗi xảy ra");
      }
    }
  }
}
  const fetchConversations = async () => {
    try {
      const decoded = jwtDecode(token);
      const role = decoded.Role;

      setUserRole(role);

      if (role !== "student" && role !== "teacher") {
        alert("Bạn không được quyền truy cập");
        navigate("/home");
        return;
      }

      const res = await axios.get("http://localhost:8000/messenger/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("conversation", res.data);
      setConversations(res.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy hội thoại:", error);
    }
  };

  // Khi click vào hội thoại
  const handleConversationClick = (conversationId) => {
    const selectedConversation = conversations.find(conv => conv._id === selectedConversationId);
    setSelectedConversationId(conversationId);
    console.log("selected id", conversationId);
    fetchMessages(conversationId);

    if (socket) {
      socket.emit("join chat", conversationId);
    }
  };
  console.log("Selected Conversation ID: ", selectedConversationId);

  // Lấy tin nhắn của hội thoại đã chọn
  const fetchMessages = async (conversationId) => {
    try {
      const res = await axios.get(`http://localhost:8000/messenger/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched messages:", res.data);

      // Kiểm tra nếu API trả về đúng kiểu dữ liệu
      if (Array.isArray(res.data.messages)) {
        const sortedMessages = res.data.messages.reverse(); // Đảo ngược nếu cần
        setMessages(sortedMessages);
      } else {
        console.error("API không trả về mảng tin nhắn!", res.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    }
  };

  useEffect(() => {
    if (!selectedConversationId || !socket) return;

    socket.emit("join chat", selectedConversationId);

    socket.on("new message", (message) => {
      setMessages((prevMessages) => {
        if (!prevMessages.some((msg) => msg._id === message._id)) {
          return [...prevMessages, message]; // Chỉ thêm nếu tin nhắn chưa tồn tại
        }
        return prevMessages;
      });
    });

    socket.on("typing", () => {
      setTyping(true);
    });

    socket.on("stop typing", () => {
      setTyping(false);
    });

    return () => {
      socket.off("new message");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [selectedConversationId, socket]);

  // Gửi tin nhắn
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    try {
      const response = await axios.post(
        "http://localhost:8000/messenger/send-message",
        {
          conversationId: selectedConversationId,
          text: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");

      if (socket) {
        socket.emit("new message", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  const handleTyping = () => {
    if (socket && selectedConversationId) {
      socket.emit("typing", selectedConversationId);
    }
  };

  const handleStopTyping = () => {
    if (socket && selectedConversationId) {
      socket.emit("stop typing", selectedConversationId);
    }
  };

  return (
      <div className={styles["messenger-container"]}>
        <div className={styles.sidebar}>
          <h2 className={styles["sidebar-title"]}>Hội thoại</h2>
          <input type="text" placeholder="Tìm kiếm..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <button onClick={handleSearch}>Tìm</button>
            <div>
              {searchResults.map((user) => (
                <div key={user._id} onClick={() => handleUser(user)} className={styles["search-result-item"]}>
                  <FaUserCircle size={20} />
                  <span>{user.Fullname}</span>
                </div>
              ))}
            </div>

          {conversations.map((conv) => (
            <div key={conv._id} onClick={() => handleConversationClick(conv._id)} className={styles["conversation-item"]}>
              <img src={conv.studentId.Image} className={styles.avatar} />
              <span>
                {conv.studentId?._id === jwtDecode(token).id ? conv.teacherId?.Fullname : conv.studentId?.Fullname}
              </span>
            </div>
          ))}
        </div>
  
        <div className={styles["chat-window"]}>
          {selectedConversationId ? (
            <>
              <div className={styles["chat-header"]}>
                <FaUserCircle className={styles["icon-lg"]} />
                <h2>
                  {(() => {
                    const conv = conversations.find((c) => c._id === selectedConversationId);
                    return conv?.studentId?._id === jwtDecode(token).id ? conv?.teacherId?.Fullname : conv?.studentId?.Fullname;
                  })()}
                </h2>
              </div>
  
              <div className={styles["message-list"]}>
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isSentByUser = msg.senderId?._id === userId;

                    return (
                      <div key={msg._id} className={`${styles.message} ${isSentByUser ? styles.sent : styles.received}`}>
                        {!isSentByUser && ( // Chỉ hiển thị avatar bên trái nếu không phải tin nhắn của user
                          <img src={msg.senderId.imageBase64 || msg.senderId.Image} className={styles.avatar} />
                        )}
                        
                        <div className={styles["message-content"]}>
                          {!isSentByUser && <span className={styles["message-sender"]}>{msg.receiverId.Fullname}</span>}
                          <div className={styles["message-bubble"]}>{msg.text}</div>
                        </div>

                        {isSentByUser && ( // Chỉ hiển thị avatar bên phải nếu là tin nhắn của user
                          <img src={msg.senderId.imageBase64 || msg.senderId.Image} className={styles.avatar} />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className={styles["no-messages"]}>Chưa có tin nhắn nào.</p>
                )}
                <div ref={messagesEndRef}></div> {/* Tự động cuộn xuống tin nhắn mới */}
              </div>
  
              <div className={styles["chat-input"]}>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleTyping}
                  onKeyUp={handleStopTyping}
                />
                <button className={styles["send-button"]} onClick={sendMessage}>
                  <FaPaperPlane />
                </button>
                {typing && <p className={styles["typing-indicator"]}>Ai đó đang nhập...</p>}
              </div>
  
              {userRole === "student" && (
                <button onClick={() => setIsMeetingFormVisible(true)} className={styles["create-meet-button"]}>
                  Tạo cuộc họp
                </button>
              )}
  
  {isMeetingFormVisible && 
  <CreateMeet 
    selectedConversationId={conversations.find(conv => conv._id === selectedConversationId)} 
  />
}

            </>
          ) : (
            <div className={styles["chat-placeholder"]}>Chọn hội thoại để bắt đầu chat</div>
          )}
        </div>
      </div>
  );
}

export default Messenger;
