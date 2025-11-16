import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
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
      admin: '/api/admin'
    }
  });
});

// Import routes when they are created
// import studentRoutes from './routes/student/index.js';
// import volunteerRoutes from './routes/volunteer/index.js';
// import stallRoutes from './routes/stall/index.js';
// import adminRoutes from './routes/admin/index.js';

// app.use('/api/student', studentRoutes);
// app.use('/api/volunteer', volunteerRoutes);
// app.use('/api/stall', stallRoutes);
// app.use('/api/admin', adminRoutes);

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
