const Conversation = require('../models/Conversation');
const Messenger = require('../models/Messenger');
const User = require('../models/User'); 

const searchAndCreateConversation = async (req, res) => {
  try {
    const { searchText } = req.body;
    const userId = req.user.id; 
    const userRole = req.user.Role;

    let userToSearch;
    if (userRole === 'student') {
      userToSearch = await User.findOne({ Role: 'teacher', Fullname: { $regex: searchText, $options: 'i' } });
    } else if (userRole === 'teacher') {
      userToSearch = await User.findOne({ Role: 'student', Fullname: { $regex: searchText, $options: 'i' } });
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!userToSearch) {
      return res.status(404).json({ message: 'User not found' });
    }

    let existingConversation = await Conversation.findOne({
      $or: [
        { studentId: userId, teacherId: userToSearch._id },
        { studentId: userToSearch._id, teacherId: userId },
      ],
    });

    if (!existingConversation) {
      const newConversation = new Conversation({
        studentId: userRole === 'student' ? userId : userToSearch._id,
        teacherId: userRole === 'teacher' ? userId : userToSearch._id,
      });

      const savedConversation = await newConversation.save();
      return res.status(201).json(savedConversation);
    }

    return res.status(200).json(existingConversation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body; 
    const userId = req.user.id; 

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.studentId.toString() !== userId && conversation.teacherId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to send messages in this conversation' });
    }

    const newMessage = new Messenger({
      conversationId: conversation._id,
      senderId: userId,
      receiverId: userId === conversation.studentId ? conversation.teacherId : conversation.studentId,
      text,
    });

    const savedMessage = await newMessage.save();

    conversation.lastMessage = savedMessage._id;
    await conversation.save();

    const io = req.app.get('io'); 
    io.to(conversationId).emit('new message', savedMessage);
    io.to(conversationId).emit('message delivered', { messageId: savedMessage._id, status: 'delivered' });

    return res.status(201).json(savedMessage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

const markMessageAsDelivered = async (conversationId, messageId) => {
  try {
    // Tìm tin nhắn và cập nhật trạng thái thành 'delivered'
    const message = await Messenger.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Chỉ cập nhật trạng thái nếu tin nhắn chưa được delivered
    if (message.status === 'sent') {
      message.status = 'delivered';
      await message.save();
    }
  } catch (err) {
    console.error(err);
    throw new Error('Error while updating message status to delivered');
  }
};

const markMessageAsRead = async (messageId) => {
  try {
    const message = await Messenger.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.status === 'delivered') {
      message.status = 'read';
      await message.save();

      // Phát sự kiện 'message read' khi tin nhắn đã được đọc
      const io = req.app.get('io');
      io.to(message.conversationId).emit('message read', { messageId: message._id, status: 'read' });
    }
  } catch (err) {
    console.error(err);
    throw new Error('Error while updating message status to read');
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ req.user, đã được xác thực trong middleware
    
    // Tìm tất cả các cuộc trò chuyện mà userId là studentId hoặc teacherId
    const conversations = await Conversation.find({
      $or: [
        { studentId: userId },
        { teacherId: userId }
      ]
    })
    .populate('studentId', 'Fullname')  // Thêm thông tin Fullname của sinh viên
    .populate('teacherId', 'Fullname'); // Thêm thông tin Fullname của giáo viên

    // Nếu không có cuộc trò chuyện nào
    if (!conversations || conversations.length === 0) {
      return res.status(404).json({ message: 'No conversations found' });
    }

    // Trả về tất cả cuộc trò chuyện tìm được
    return res.status(200).json(conversations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query; // Default limit is 20 messages per page
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (conversation.studentId.toString() !== userId && conversation.teacherId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to access this conversation' });
    }

    const skip = (page - 1) * limit;

    const messages = await Messenger.find({ conversationId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'Fullname')
      .populate('receiverId', 'Fullname');

    const totalMessages = await Messenger.countDocuments({ conversationId });

    return res.status(200).json({
      messages,
      page,
      limit,
      totalMessages,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

module.exports = { searchAndCreateConversation, sendMessage, getConversations, getMessages, markMessageAsDelivered, markMessageAsRead };
