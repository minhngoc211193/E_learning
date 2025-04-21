var express = require('express');
var path = require('path');
var logger = require('morgan');
const dotenv = require('dotenv');
var mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const socketIo = require('socket.io'); // Import Socket.IO
const userSocketMap = new Map();
dotenv.config();
const app = express();


const authRouter = require('./routes/auth');
const majorRouter = require('./routes/major');
const blogRouter = require('./routes/blog');

const attendanceRouter = require('./routes/attendance');

const commentRouter = require('./routes/comment');
const subjectRouter = require('./routes/subject');
const classRouter = require('./routes/class');
const userRouter = require('./routes/users');
const documentRouter = require('./routes/document');
const scheduleRouter = require('./routes/schedule');
const messagesRouter = require('./routes/messenger');
const googleMeetRoutes = require('./routes/meet');
const notificationRoutes = require('./routes/notification');
const dashboardRoutes = require('./routes/dashboard');


app.use(cors())

// Xử lý preflight OPTIONS cho tất cả các route
app.options('*', cors());

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
app.use('/attendance', attendanceRouter);
app.use('/messenger', messagesRouter);
app.use('/meet', googleMeetRoutes);
app.use('/notification', notificationRoutes);
app.use('/dashboard', dashboardRoutes);

// Kết nối MongoDB
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
    origin: "*",
  },
});

app.set('io', io);

io.on("connection", (socket) => {
  socket.on('register', (userId) => {
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
    userSocketMap.set(userId.toString(), socket.id);
  });

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

  socket.on('receive notification', async (notification) => {
    try {
      if (!notification || !notification.receiverId) {
        return console.log("Invalid notification data");
      }
      // Trực tiếp gửi thông báo đến người nhận
      io.to(notification.receiverId.toString()).emit('receive notification', notification);
    } catch (error) {
      console.error('Error handling receive notification:', error);
    }
  });

  socket.on('mark notification read', async (notificationId) => {
    try {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  socket.on("newBlog", (blog) => {
    console.log("New blog created: ", blog);
  });

  socket.on("newClass", (classs) => {
    console.log("New class created: ", classs);
  });

  socket.on("newMajor", (major) => {
    console.log("New major created: ", major);
  });

  socket.on("newSubject", (subject) => {
    console.log("New subject created: ", subject);
  });

  socket.on("newUser", (user) => {
    console.log("New user created: ", user);
  });

  socket.on("deleteBlog", (blogId) => {
    console.log("Blog đã bị xóa: ", blogId);
  });

  socket.on("deleteClass", (classId) => {
    console.log("Class đã bị xóa: ", classId);
  });

  socket.on("deleteMajor", (majorId) => {
    console.log("Major đã bị xóa: ", majorId);
  });

  socket.on("deleteSubject", (subjectId) => {
    console.log("Subject đã bị xóa: ", subjectId);
  });

  socket.on("deleteUser", (userId) => {
    console.log("User đã bị xóa: ", userId);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

module.exports = server;

