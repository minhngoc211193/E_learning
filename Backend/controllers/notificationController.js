const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (senderId, receiverId, type, message) => {
  try {
    const newNotification = new Notification({
      type: type,
      sender: senderId,
      receiver: receiverId,
      message: message,

    });
    
    const savedNotification = await newNotification.save();
    io.to(receiverId.toString()).emit('receive notification', savedNotification);

    // Trả về thông báo để sử dụng trong socket
    return savedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm tất cả thông báo của người dùng, sắp xếp theo thời gian gần nhất
    const notifications = await Notification.find({ receiver: userId })
      .populate('sender', 'Fullname') // Populate thông tin người gửi (nếu cần)
      .sort({ createdAt: -1 }) // Sắp xếp từ mới nhất đến cũ nhất
      .lean(); // Chuyển đổi sang đối tượng JavaScript thuần để tối ưu hiệu suất

    // Đếm số thông báo chưa đọc
    const unreadCount = await Notification.countDocuments({ 
      receiver: userId, 
      isRead: false 
    });

    return res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({ 
      message: 'Lỗi server khi lấy thông báo', 
      error: error.message 
    });
  }
};


module.exports = { 
  createNotification, getAllNotifications

};