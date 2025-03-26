var express = require('express');
var path = require('path');
var logger = require('morgan');
const dotenv = require('dotenv');
var mongoose = require('mongoose');
const cookieParser = require('cookie-parser');  
const cors = require('cors');
const socketIo = require('socket.io'); // Import Socket.IO

dotenv.config();
const app = express();

// Router
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
const googleMeetRoutes = require('./routes/meet');

// Cấu hình middlewares
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Router
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
app.use('/meet', googleMeetRoutes);

const connectToMongo = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
};
connectToMongo();

const http = require('http');
const server = http.createServer(app);

const io = socketIo(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000", 
  },
});

app.set('io', io);

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    if (!userData || !userData._id) return;
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });
  
  socket.on("new message", (newMessageRecieved) => {
    if (!newMessageRecieved) return console.log("chat.users not defined");
    const senderId = newMessageRecieved.senderId;  
    const receiverId = newMessageRecieved.receiverId; 
    if (senderId === receiverId) return;
    socket.to(receiverId).emit("message received", newMessageRecieved);
});

  socket.on("disconnect", () => {
    console.log("User Disconnected");
    const userData = socket.handshake.query.userData;
    if (userData && userData._id) {
      socket.leave(userData._id);
    }
  });
});

module.exports = server;
