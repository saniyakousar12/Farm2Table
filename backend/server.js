const app = require('./src/app');
const http = require('http');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with proper CORS
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Store online users
const onlineUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // User authentication for socket
  socket.on('authenticate', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} authenticated with socket ${socket.id}`);
    console.log(`📊 Online users: ${onlineUsers.size}`);
  });
  
  // Join order room for real-time updates
  socket.on('join-order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`📦 Socket ${socket.id} joined order_${orderId}`);
  });
  
  // Leave order room
  socket.on('leave-order', (orderId) => {
    socket.leave(`order_${orderId}`);
    console.log(`📦 Socket ${socket.id} left order_${orderId}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user from online users
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
    console.log('🔌 Client disconnected:', socket.id);
    console.log(`📊 Online users: ${onlineUsers.size}`);
  });
});

// Make io accessible to routes
app.set('io', io);
app.set('onlineUsers', onlineUsers);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api/v1`);
  console.log(`🔌 Socket.io enabled for real-time updates`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Closing server...');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});