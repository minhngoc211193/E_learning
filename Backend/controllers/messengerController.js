const Messenger = require('../models/Messenger');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// API để gửi tin nhắn mới
const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;  // Lấy receiverId và text từ request body
    const senderId = req.user.id;  // Lấy senderId từ thông tin người dùng trong token

    // Kiểm tra xem conversation đã tồn tại chưa
    let conversation = await Conversation.findOne({ studentId: senderId, teacherId: receiverId });
    if (!conversation) {
      conversation = new Conversation({ studentId: senderId, teacherId: receiverId });
      await conversation.save();
    }

    // Tạo tin nhắn mới với trạng thái 'sent'
    const newMessage = new Messenger({
      conversationId: conversation._id,
      senderId,
      receiverId,
      text,
      status: 'sent',  // Trạng thái ban đầu là 'sent'
    });
    await newMessage.save();

    // Tạo phòng chat và phát sự kiện mới qua Socket.io
    const roomId = `room_${senderId}_${receiverId}`;
    req.app.get('io').to(roomId).emit('newMessage', { senderId, text, timestamp: newMessage.timestamp });

    return res.status(200).json({ message: 'Tin nhắn đã được gửi', newMessage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi gửi tin nhắn' });
  }
};

// API để cập nhật trạng thái tin nhắn
const updateMessageStatus = async (req, res) => {
  try {
    const { messageId, status } = req.body;

    if (!['sent', 'delivered', 'read'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // Cập nhật trạng thái tin nhắn
    const message = await Messenger.findByIdAndUpdate(messageId, { status }, { new: true });

    // Phát sự kiện cập nhật trạng thái tin nhắn qua Socket.io
    const roomId = `room_${message.senderId}_${message.receiverId}`;
    req.app.get('io').to(roomId).emit('messageStatusUpdated', { messageId, status });

    return res.status(200).json({ message: 'Trạng thái tin nhắn đã được cập nhật', message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái tin nhắn' });
  }
};

// API để tìm kiếm người dùng và tạo conversation
const searchUserAndCreateConversation = async (req, res) => {
  try {
    const { searchText } = req.body; // Tìm kiếm theo Fullname
    const userId = req.user.id;  // Lấy userId từ thông tin người dùng trong token

    // Kiểm tra quyền (student hoặc teacher) của người dùng
    const role = req.user.Role;
    console.log("User Role:", req.user.Role);

    let targetUser = null;
    const formattedSearchText = searchText.trim().replace(/\s+/g, ' '); // Loại bỏ khoảng trắng thừa

    if (role === 'student') {
      targetUser = await User.findOne({
        Fullname: { $regex: formattedSearchText, $options: 'i' },
        Role: 'teacher'
      });
    } else if (role === 'teacher') {
      targetUser = await User.findOne({
        Fullname: { $regex: formattedSearchText, $options: 'i' },
        Role: 'student'
      });
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra xem conversation đã tồn tại chưa
    let conversation = await Conversation.findOne({
      $or: [
        { studentId: userId, teacherId: targetUser._id },
        { studentId: targetUser._id, teacherId: userId }
      ]
    });

    // Nếu conversation chưa tồn tại, tạo mới
    if (!conversation) {
      conversation = new Conversation({
        studentId: userId,
        teacherId: targetUser._id
      });
      await conversation.save();
    }

    // Trả về thông tin người dùng tìm được và cuộc trò chuyện
    return res.status(200).json({
      message: 'Tìm kiếm thành công',
      targetUser,
      conversation
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi tìm kiếm người dùng hoặc tạo conversation' });
  }
};

// API để lấy tin nhắn của một conversation
const getMessageHistory = async (req, res) => {
  try {
    const { conversationId, page = 1 } = req.query;  // Lấy conversationId từ query, page mặc định là 1
    const limit = 20;  // Giới hạn số tin nhắn mỗi lần tải là 20

    // Tính toán số lượng tin nhắn cần bỏ qua (skip) để thực hiện phân trang
    const skip = (page - 1) * limit;

    // Lấy tin nhắn của conversation với phân trang
    const messages = await Messenger.find({ conversationId })
      .sort({ timestamp: -1 })  // Sắp xếp tin nhắn theo thời gian giảm dần (tin nhắn mới nhất lên đầu)
      .skip(skip)  // Bỏ qua số tin nhắn đã tải ở các trang trước
      .limit(limit);  // Giới hạn số tin nhắn lấy được mỗi lần

    // Đếm tổng số tin nhắn trong conversation
    const totalMessages = await Messenger.countDocuments({ conversationId });

    return res.status(200).json({
      message: 'Lấy tin nhắn thành công',
      messages,
      totalMessages
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi lấy tin nhắn' });
  }
};

// API để lấy tất cả các cuộc trò chuyện của người dùng
const getAllConversations = async (req, res) => {
  try {
    const userId = req.user.id;  // Lấy userId từ thông tin người dùng trong token
    const role = req.user.Role;  // Lấy role (student, teacher) của người dùng

    console.log("User from token:", req.user);

    // Tìm tất cả các conversation mà người dùng tham gia (dựa trên studentId hoặc teacherId)
    let conversations;
    if (role === 'student') {
      conversations = await Conversation.find({ studentId: userId }).populate('teacherId', 'Fullname');
    } else if (role === 'teacher') {
      conversations = await Conversation.find({ teacherId: userId }).populate('studentId', 'Fullname');
    }

    if (!conversations || conversations.length === 0) {
      return res.status(404).json({ message: 'Không có cuộc trò chuyện nào' });
    }

    return res.status(200).json({
      message: 'Lấy danh sách cuộc trò chuyện thành công',
      conversations
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách cuộc trò chuyện' });
  }
};

// API để thông báo trạng thái "typing" khi người dùng đang gõ tin nhắn
const typingStatus = async (req, res) => {
  try {
    const { receiverId } = req.body; // Lấy receiverId từ request body
    const senderId = req.user.id;  // Lấy senderId từ thông tin người dùng trong token

    // Tạo đối tượng chứa thông tin người đang gõ
    const typingData = {
      senderId,
      receiverId,
      status: 'typing'
    };

    // Phát sự kiện "typing" qua Socket.io
    req.app.get('io').to(`room_${receiverId}`).emit('typing', typingData);

    return res.status(200).json({ message: 'Đang gõ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi gửi trạng thái gõ tin nhắn' });
  }
};


module.exports = { sendMessage, getMessageHistory, updateMessageStatus, searchUserAndCreateConversation, getAllConversations, typingStatus };