var express = require('express');
var path = require('path');
var logger = require('morgan');
const dotenv = require('dotenv');
var mongoose = require('mongoose');
const cookieParser = require('cookie-parser');  
const cors = require('cors');


dotenv.config();
const app = express();


var authRouter = require('./routes/auth');


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);

var database = "mongodb+srv://group5:group5@elearning.swlhy.mongodb.net/E_Learning";
mongoose.connect(database)
    .then(() => console.log('✅ Connected to MongoDB successfully!'))
    .catch((err) => console.error('❌ Connection to DB failed. Error:', err));  

    
module.exports = app;
