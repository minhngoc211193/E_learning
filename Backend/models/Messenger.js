const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // người gửi tin nhắn
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // người nhận tin nhắn
  text: { type: String, required: true },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }, // Trạng thái tin nhắn
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Messenger = mongoose.model('Messenger', messSchema, 'messengers');

module.exports = Messenger;
