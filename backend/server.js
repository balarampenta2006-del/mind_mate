import express from 'express';
import cors from 'cors';
import { config } from './src/config/config.js';
import { notFoundHandler, errorHandler } from './src/middleware/errorHandler.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import therapistRoutes from './src/routes/therapistRoutes.js';
import moodRoutes from './src/routes/moodRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import sosRoutes from './src/routes/sosRoutes.js';
import emergencyRoutes from './src/routes/emergencyRoutes.js';
import { getEmergencyView } from './src/controllers/emergencyController.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import recommendationRoutes from './src/routes/recommendationRoutes.js';
import meditationRoutes from './src/routes/meditationRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import therapistPortalRoutes from './src/routes/therapistPortalRoutes.js';

const app = express();

// Middleware — CORS origins come from the CORS_ORIGIN env (comma separated).
const corsOptions = config.corsOrigin.length
  ? { origin: config.corsOrigin, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }
  : { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] };

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

import { connectDB, isMongoConnected } from './src/config/database.js';

// Root route handler
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to SMHC (Smart Mental Health Care Companion) API Server',
    healthCheck: 'http://localhost:' + config.port + '/api/health',
    status: 'online',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'SMHC – Smart Mental Health Care Companion API',
    database: isMongoConnected() ? 'MongoDB (connected)' : 'In-Memory (fallback)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Public Emergency View route
app.get('/api/emergency/view', getEmergencyView);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/emergency-contacts', emergencyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/meditation', meditationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/therapist', therapistPortalRoutes);

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server (skip when running on Vercel — it uses the serverless entry point)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  (async () => {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 SMHC Backend Server is running!`);
      console.log(`📡 Base URL: http://localhost:${config.port}/api`);
      console.log(`🍃 Database: ${isMongoConnected() ? 'MongoDB' : 'In-Memory Store (fallback)'}`);
      console.log(`🩺 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`====================================================`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.port} is already in use. Set PORT in backend/.env to a free port.`);
      } else {
        console.error('❌ Failed to start the server:', err.message);
      }
      process.exit(1);
    });
  })();
}

export default app;
