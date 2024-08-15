const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Import route modules
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');

// Import models
const Message = require('./models/Message'); 
const User = require('./models/User'); 

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    socket.join(userId);
    socket.userId = userId; // Set userId for later use
  });

  socket.on('sendMessage', async ({ senderId, recipientId, content }) => {
    const message = new Message({ sender: senderId, recipient: recipientId, content });
    await message.save();
    io.to(recipientId).emit('newMessage', message);
  });

  socket.on('updateStatus', async ({ userId, status }) => {
    await User.findByIdAndUpdate(userId, { $set: { status } });
    socket.broadcast.emit('userStatusChanged', { userId, status });
  });

  socket.on('typing', ({ userId, recipientId }) => {
    socket.to(recipientId).emit('userTyping', userId);
  });

  socket.on('stopTyping', ({ userId, recipientId }) => {
    socket.to(recipientId).emit('userStoppedTyping', userId);
  });

  socket.on('markAsRead', async ({ messageId, userId }) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId } },
        { new: true }
      );
      socket.to(message.sender.toString()).emit('messageRead', { messageId, userId });
    } catch (error) {
      console.error('Failed to mark message as read', error);
    }
  });

  socket.on('userConnected', async (userId) => {
    await User.findByIdAndUpdate(userId, { isOnline: true });
    socket.broadcast.emit('userStatusChanged', { userId, isOnline: true });
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, { isOnline: false });
      socket.broadcast.emit('userStatusChanged', { userId: socket.userId, isOnline: false });
    }
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));