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

const commentRouter = require('./routes/comment');
const subjectRouter = require('./routes/subject');
const classRouter = require('./routes/class');
const userRouter = require('./routes/users');

const messagesRoutes = require('./routes/messenger');


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
app.use('/comment', commentRouter);
app.use('/subject', subjectRouter);
app.use('/class', classRouter);
app.use('/user', userRouter);

app.use('/messenger', messagesRoutes);

// connect to mongodb
const connectToMongo = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
};
connectToMongo();

    
module.exports = app;
