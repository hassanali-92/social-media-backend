import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js'; // Aapka DB connection file

// Routes Imports (Apne mutabiq check kar lein)
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

// 🌐 CORS Configuration for Deployment
// Yeh frontend ke localhost aur live URL dono ko allow karega
const allowedOrigins = [
  'http://localhost:5173', // Local Frontend
  process.env.FRONTEND_URL // Live Frontend URL (Jo deployment ke baad milega)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Socket.io Setup with Deployment CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Database Connection
connectDB();

// Socket.io Logic
export const userSocketMap = new Map();
io.on('connection', (socket) => {
  socket.on('join_user', (userId) => {
    userSocketMap.set(userId, socket.id);
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

export const sendRealTimeNotification = (receiverId, data) => {
  const socketId = userSocketMap.get(receiverId);
  if (socketId) {
    io.to(socketId).emit('new_notification', data);
  }
};

// Routes Middlewares
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

// Root Check for Server Health
app.get('/', (req, res) => {
  res.send('Social Media Backend API is running successfully...');
});

// 🔌 Dynamic Port Configuration (CRITICAL FOR DEPLOYMENT)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is blasting on port ${PORT}`);
});