import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true // Enable cookies and authentication headers
}));
app.use(compression());
app.use(cookieParser()); // Parse cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SGT University Event Management API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'SGT University Event Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      students: '/api/student',
      volunteers: '/api/volunteer',
      stalls: '/api/stall',
      admin: '/api/admin',
      feedback: '/api/feedback',
      ranking: '/api/ranking',
      checkInOut: '/api/check-in-out'
    }
  });
});

// Import routes
import {
  adminRoutes,
  studentRoutes,
  volunteerRoutes,
  stallRoutes,
  feedbackRoutes,
  rankingRoutes,
  checkInOutRoutes
} from './routes/index.js';

// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/stall', stallRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/check-in-out', checkInOutRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
  console.log(`🎓 SGT University Event Management System`);
  console.log(`👥 Ready for 11,000+ students | 200+ stalls`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
