const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
    User: {type: mongoose.Schema.Types.ObjectId, ref:"User" },
    Messengers: [{type: mongoose.Schema.Types.ObjectId, ref:"Messenger"}]
})

const Conversation = mongoose.model('Conversation', conversationSchema, "conversations");
module.exports = Conversation;