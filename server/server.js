const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const http = require('http');
const socketIo = require('socket.io');
const groupRoutes = require('./routes/groups');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/groups', groupRoutes);

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

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    socket.join(userId);
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
});

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));