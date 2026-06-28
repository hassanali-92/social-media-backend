import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Routes Imports
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

// 🌐 1. FULLY OPEN CORS FOR DEPLOYMENT (No more Vercel/CORS blocks)
app.use(cors({
  origin: '*', 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json()); // Body parser to read incoming JSON data

// 🔌 2. Socket.io Setup with Open CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Database Connection
connectDB();

// Live Socket.io Connections Management
export const userSocketMap = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on('join_user', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`👤 User ${userId} linked to socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`🚫 User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Real-Time Notification Trigger Function
export const sendRealTimeNotification = (receiverId, data) => {
  const socketId = userSocketMap.get(receiverId);
  if (socketId) {
    io.to(socketId).emit('new_notification', data);
  }
};

// 🎯 3. Routes Middlewares (Prefix with /api)
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

// Server Root Route (Health Check)
app.get('/', (req, res) => {
  res.send('Social Media Backend API is running successfully...');
});

// Dynamic Port for Deployment (Render defaults to process.env.PORT)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is blasting on port ${PORT}`);
});
