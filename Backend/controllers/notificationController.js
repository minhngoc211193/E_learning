const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (senderId, receiverId, type, message) => {
  try {
    const newNotification = new Notification({
      type: type,
      sender: senderId,
      receiver: receiverId,
      message: message
    });

    const savedNotification = await newNotification.save();

    // Trả về thông báo để sử dụng trong socket
    return savedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadNotifications = await Notification.find({ 
      receiver: userId, 
      isRead: false 
    })
    .populate('sender', 'Fullname')
    .sort({ createdAt: -1 });

    return res.status(200).json(unreadNotifications);
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return res.status(500).json({ message: 'Server error', error: error });
}};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, receiver: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Server error', error: error });
  }
};

module.exports = { 
  createNotification, 
  getUnreadNotifications, 
  markNotificationAsRead 
};