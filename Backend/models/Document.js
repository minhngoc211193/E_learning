const mongoose = require('mongoose');
const documentSchema = new mongoose.Schema({
    Tittle: {type:String, required:true},
    Description:{type:String, required:true},
    File:{type:String, required:true},
    Class:{type: mongoose.Schema.Type.ObjectId, ref:"Class"}
}, {timestamps: true});
const Document = mongoose.model("Document", documentSchema, "documents");
module.exports = Document;