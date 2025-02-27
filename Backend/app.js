var express = require('express');
var path = require('path');
var logger = require('morgan');
const dotenv = require('dotenv');
var mongoose = require('mongoose');
const cookieParser = require('cookie-parser');  
const cors = require('cors');


dotenv.config();
const app = express();


const authRouter = require('./routes/auth');
const majorRouter = require('./routes/major');
const blogRouter = require('./routes/blog');


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Router
app.use('/auth', authRouter);
app.use('/major', majorRouter);
app.use('/blog', blogRouter);

// connect to mongodb
const connectToMongo = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
};
connectToMongo();

    
module.exports = app;
