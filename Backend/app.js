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
const documentRouter = require('./routes/document');
const scheduleRouter = require('./routes/schedule');

const messagesRoutes = require('./routes/messenger');


app.use(cors({
    origin: "http://localhost:3000", // Cho phép frontend từ localhost:3000
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"], // Các header được phép
  }));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Socket.io CORS
    methods: ["GET", "POST"],
  }
});

// Khởi tạo kết nối Socket.IO
io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(8000, () => {
  console.log('Server running on http://localhost:8000');
});

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
app.use('/document', documentRouter);
app.use('/schedule', scheduleRouter);

app.use('/messenger', messagesRoutes);

// connect to mongodb
const connectToMongo = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
};
connectToMongo();

    
module.exports = app;
