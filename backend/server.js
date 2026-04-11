require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/database');
const logger = require('./config/logger');
const { sendResponse, sendError, AppError } = require('./utils/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const careerRoutes = require('./routes/careerRoutes');
const skillRoutes = require('./routes/skillRoutes');
const learningRoutes = require('./routes/learningRoutes');
const jobRoutes = require('./routes/jobRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const communicationRoutes = require('./routes/communicationRoutes');

// Import scheduled jobs
const { startScheduledJobs } = require('./jobs/scheduleJobs');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/ai', communicationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  sendResponse(res, 200, true, 'Server is running', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error(`${error.message}\n${error.stack}`);
  
  if (process.env.NODE_ENV === 'development') {
    sendError(res, error);
  } else {
    // Don't leak error details in production
    if (error.isOperational) {
      sendError(res, error);
    } else {
      sendError(res, new AppError('Internal server error', 500));
    }
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  // Handle job alert subscription
  socket.on('subscribe_jobs', (filters) => {
    socket.join('job_alerts');
    logger.info(`User subscribed to job alerts: ${JSON.stringify(filters)}`);
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    io.to(`user_${data.receiverId}`).emit('receive_message', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`📡 API available at http://localhost:${PORT}/api`);
  
  // Start scheduled jobs
  if (process.env.NODE_ENV !== 'test') {
    startScheduledJobs();
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = { app, server, io };
