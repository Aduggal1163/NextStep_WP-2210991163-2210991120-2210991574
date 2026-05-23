import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import dbconnect from './DB/dbconnect.js';
import dotenv from "dotenv";
import cors from 'cors';
import AuthRoutes from './Routes/Auth.routes.js';
import UserRoutes from './Routes/User.routes.js';
import BookingRoutes from './Routes/Booking.routes.js';
import DestinationRoutes from './Routes/Destination.routes.js';
import PackageRoutes from './Routes/Package.routes.js';
import PlannerRoutes from './Routes/Planner.routes.js';
import VendorRoutes from './Routes/Vendor.routes.js';
import AdminRoutes from './Routes/Admin.routes.js';
import ChatRoutes from './Routes/Chat.routes.js';
import NotificationRoutes from './Routes/Notification.routes.js';
import ChecklistRoutes from './Routes/Checklist.routes.js';
import GalleryRoutes from './Routes/Gallery.routes.js';
import RecommendationRoutes from './Routes/Recommendation.routes.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (authHeader) {
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id || decoded._id;
      socket.userRole = decoded.role;
    } catch (err) {
      console.warn('Socket auth failed:', err.message);
    }
  }
  next();
});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Global multer for file uploads (safe dirs)
const globalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!require('fs').existsSync(uploadPath)) {
      require('fs').mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
app.use(multer({ storage: globalStorage }).any());

// NEW Routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/booking", BookingRoutes);
app.use("/api/v1/destination", DestinationRoutes);
app.use("/api/v1/package", PackageRoutes);
app.use("/api/v1/planner", PlannerRoutes);
app.use("/api/v1/vendor", VendorRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/chat", ChatRoutes);
app.use("/api/v1/notification", NotificationRoutes);
app.use("/api/v1/checklist", ChecklistRoutes);
app.use("/api/v1/gallery", GalleryRoutes);
app.use("/api/v1/recommendation", RecommendationRoutes);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "Enhanced Server running with real-time features" });
});

// Socket.io - Real-time chat & notifications
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join chat room
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Chat message
  socket.on('send-message', async ({ chatId, message, bookingId }) => {
    // Save to DB (from Chat.controller logic)
    const chatMessage = {
      chatId,
      senderId: socket.userId, // Set after auth
      senderModel: socket.userRole,
      message,
      bookingId,
    };
    // In full impl: save to DB here, emit saved message
    socket.to(chatId).emit('new-message', chatMessage);
  });

  // Notification emit
  socket.on('send-notification', (data) => {
    // Emit to specific user rooms
    socket.to(data.userId).emit('new-notification', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Attach io to req for controllers if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await dbconnect();
  server.listen(PORT, () => {
    console.log(`Enhanced Server + Socket.io on port ${PORT}`);
    console.log('🚀 Backend ready with all new features!');
  });
};

startServer();
