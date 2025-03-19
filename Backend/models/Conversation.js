const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
    Teacher:{
        type:mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required:true,
        validate:{
            validator: async function(teacherID){
                const user = await mongoose.model("User").findById(teacherID);
                return user && user.Role ==="teacher";
            },
            message: "User role have to be teacher"
        }
    },
     Student:{
            type:mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required:true,
            validate:{
                validator: async function(studentID){
                    const user = await mongoose.model("User").findById(studentID);
                    return user && user.Role ==="student";
                },
                message: "User role have to be teacher"
            }
        },
    Messengers: [{type: mongoose.Schema.Types.ObjectId, ref:"Messenger"}]
})

const Conversation = mongoose.model('Conversation', conversationSchema, "conversations");
module.exports = Conversation;