const Conversation = require('../models/Conversation');
const Messenger = require('../models/Messenger');
const User = require('../models/User'); 
const {createNotification} = require('./notificationController')

const searchUser = async (req, res) => {
  try {
    const { searchText } = req.body;
    const userId = req.user.id;
    const userRole = req.user.Role;

    let userToSearch;
    if (userRole === 'student') {
      userToSearch = await User.findOne({ 
        Role: 'teacher', 
        Fullname: { $regex: searchText, $options: 'i' } 
      });
    } else if (userRole === 'teacher') {
      userToSearch = await User.findOne({ 
        Role: 'student', 
        Fullname: { $regex: searchText, $options: 'i' } 
      });
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!userToSearch) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(userToSearch);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

const createConversation = async (req, res) => {
  try {
    const { searchedUserId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.Role;

    const userToSearch = await User.findById(searchedUserId);
    if (!userToSearch) {
      return res.status(404).json({ message: 'User not found' });
    }

    let existingConversation = await Conversation.findOne({
      $or: [
        { studentId: userId, teacherId: searchedUserId },
        { studentId: searchedUserId, teacherId: userId },
      ],
    });

    if (!existingConversation) {
      const newConversation = new Conversation({
        studentId: userRole === 'student' ? userId : searchedUserId,
        teacherId: userRole === 'teacher' ? userId : searchedUserId,
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

    // Thông báo từ bên notifiControllernotifiController
    const receiverId = userId === conversation.studentId ? conversation.teacherId : conversation.studentId;
    const notification = await createNotification(
      userId, 
      receiverId, 
      'MESSAGE', 
      `Bạn có tin nhắn mới từ ${req.user.Fullname}`
    );

    const io = req.app.get('io'); 
    io.to(conversationId).emit('new message', savedMessage);
    io.to(conversationId).emit('message delivered', { messageId: savedMessage._id, status: 'delivered' });

    if (notification) { // notification real-time
      io.to(receiverId.toString()).emit('new notification', notification);
    }

    return res.status(201).json(savedMessage);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
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

module.exports = { searchUser, createConversation, sendMessage, getConversations, getMessages };
