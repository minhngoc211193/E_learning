const mongoose = require('mongoose');
const notiSchema = new mongoose.Schema({
    MessContent:{type:String, required: true},
    User:{type: mongoose.Schema.Types.ObjectId, ref:"User"}
}, {timestamps: true});
const Notification = mongoose.model('Notification', notiSchema, "notifications");
module.exports = Notification;
