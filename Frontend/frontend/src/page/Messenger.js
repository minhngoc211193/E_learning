import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPaperPlane, FaUserCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import CreateMeet from "./CreateMeet";
import createSocket from "./Socket";
import styles from "./Messenger.module.css";
import BackButton from "../components/BackButton";

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

  const handleUser = async (user) => {
    try {
      const response = await axios.post("http://localhost:8000/messenger/create",
        {
          searchUserId: user._id, // Sửa lại để match với backend
        }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Nếu có conversation trả về, set conversation đó
      setSelectedConversationId(response.data._id);

      // Nếu là conversation mới, fetch messages
      fetchMessages(response.data._id);
    } catch (e) {
      console.error("Error creating conversation:", e)
      // Xử lý các loại lỗi khác nhau nếu cần
      if (e.response) {
        switch (e.response.status) {
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
  const getAvatarSrc = (sender) => {
    if (!sender) return "";
    // Ưu tiên dùng sender.imageBase64 nếu có
    if (sender.imageBase64) return sender.imageBase64;
    // Nếu sender.Image là object, lấy thuộc tính base64
    if (sender.Image && typeof sender.Image === "object") {
      return sender.imageBase64;
    }
    // Nếu sender.Image không phải object thì trả về luôn nó
    return sender.imageBase64;
  };


  return (
    <div className={styles["messenger-container"]}>
      <BackButton />
      <div className={styles.sidebar}>
        <h2 className={styles["sidebar-title"]}>Messenger</h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { handleSearch(); }
          }}
        />
        <div>
          {searchResults.map((user) => (
            <div key={user._id} onClick={() => handleUser(user)} className={styles["search-result-item"]}>
              <FaUserCircle size={20} />
              <span>{user.Fullname}</span>
            </div>
          ))}
        </div>

        {conversations.map((conv) => (
          <div
            key={conv._id}
            onClick={() => handleConversationClick(conv._id)}
            className={styles["conversation-item"]}
          >
            <img src={conv.studentId?._id === jwtDecode(token).id ? conv.teacherId?.Image : conv.studentId?.Image} className={styles.avatar} />
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
              <img
                src={(() => {
                  const conv = conversations.find((c) => c._id === selectedConversationId);
                  const isStudent = conv?.studentId?._id === jwtDecode(token).id;
                  return isStudent ? conv?.teacherId?.Image : conv?.studentId?.Image;
                })()}
                alt="Receiver Avatar"
                className={styles["icon-lg"]}
              />
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
                  const isSentByUser = typeof msg.senderId === 'string'
                    ? msg.senderId === userId
                    : msg.senderId?._id === userId;
                  return (
                    <div key={msg._id} className={`${styles.message} ${isSentByUser ? styles.sent : styles.received}`}>
                      {!isSentByUser && (
                        <img src={getAvatarSrc(msg.senderId)} className={styles.avatar} />
                      )}
                      <div className={styles["message-content"]}>
                        {!isSentByUser && <span className={styles["message-sender"]}>{msg.senderId.Fullname}</span>}
                        <div className={styles["message-bubble"]}>{msg.text}</div>
                      </div>
                      {isSentByUser && (
                        <img src={getAvatarSrc(msg.senderId)} className={styles.avatar} />
                      )}
                    </div>
                  );
                })
              ) : (
                <p className={styles["no-messages"]}>No messages</p>
              )}
              <div ref={messagesEndRef}></div>
            </div>

            <div className={styles["chat-input-wrapper"]}>
              {userRole === "student" && (
                <button onClick={() => setIsMeetingFormVisible(true)} className={styles["create-meet-button"]}>
                  Create Meet
                </button>
              )}

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
                {typing && <p className={styles["typing-indicator"]}>Typing...</p>}
              </div>
            </div>

            {isMeetingFormVisible && (
              <div className={styles["create-meet-overlay"]}>
                <CreateMeet
                  selectedConversationId={conversations.find((conv) => conv._id === selectedConversationId)}
                  setIsMeetingFormVisible={setIsMeetingFormVisible}
                />
              </div>
            )}
          </>
        ) : (
          <div className={styles["chat-placeholder"]}>Please choose a user to chat with</div>
        )}
      </div>
    </div>
  );
}

export default Messenger;
