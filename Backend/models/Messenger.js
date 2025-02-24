const mongoose = require('mongoose');
const messSchema = new mongoose.Schema({
    Conversation:{type: mongoose.Schema.Types.ObjectId, ref:"Conversation"},
    Text: {type: String, required: true}
}, {timestamps: true});
const Messenger = mongoose.model('Messenger', messSchema, "messengers");
module.exports = Messenger;