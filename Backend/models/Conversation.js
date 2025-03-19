const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Messenger' },
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema, 'conversations');


module.exports = Conversation;
