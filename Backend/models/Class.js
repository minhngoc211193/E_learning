const mongoose = require('mongoose');
const classSchema = new mongoose.Schema({
    Classname: {type:String, required:true, unique:true},
    Subject:{type: mongoose.Schema.Types.ObjectId, ref: "Subject", required:true},
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
    Student:[{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"User", 
        required:true,
        validate:{
            validator: async function(studentIDs){
                const users = await mongoose.model("User").find({_id: {$in: studentIDs}});
                return users.every(user => user.Role ==="student");
            },
            message: "User role have to be student"
        }
    }],
    Schedules: [{type:mongoose.Schema.Types.ObjectId, ref:"Schedule"}],
    Assignments: [{type:mongoose.Schema.Types.ObjectId, ref:"Assignment"}],
    Documents: [{type: mongoose.Schema.Types.ObjectId, ref: "Document"}],
});

const Class = mongoose.model("Class", classSchema, "classes");

module.exports = Class;