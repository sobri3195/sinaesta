import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { env, validateEnv } from './config/env.js';
import { initializeStorage } from './services/storageService';
import { query, pool } from './config/database.js';
import { initializeSocket } from './socket/index';
import { initializeEmailService, setDatabasePool } from './services/emailService.js';
import uploadRoutes from './routes/upload';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import examRoutes from './routes/exams';
import flashcardRoutes from './routes/flashcards';
import osceRoutes from './routes/osce';
import resultRoutes from './routes/results';
import templateRoutes from './routes/templates';
import emailRoutes from './routes/email.js';
import { apiRateLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();
validateEnv();

const app = express();
const httpServer = createServer(app);
const PORT = env.PORT;

// Initialize storage service
const storageConfig = {
  provider: (env.STORAGE_PROVIDER as any) || 'local',
  region: env.AWS_REGION,
  bucket: env.S3_BUCKET,
  endpoint: env.S3_ENDPOINT,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  cdnUrl: env.CDN_URL,
};

initializeStorage(storageConfig);

// Initialize email service
setDatabasePool(pool);
initializeEmailService().catch((error) => {
  console.error('Failed to initialize email service:', error);
  // Don't stop the server if email service fails
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disabled for development
}));
app.use(cors({
    origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limiting
app.use('/api', apiRateLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await query('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: Date.now(),
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: Date.now(),
      database: 'disconnected',
      error: 'Database connection failed',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/osce', osceRoutes);
app.use('/api', uploadRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/email', emailRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Initialize Socket.IO
initializeSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Sinaesta API Server running on port ${PORT}`);
  console.log(`📁 Storage provider: ${storageConfig.provider}`);
  console.log(`🗄️  Database: ${env.DB_HOST}:${env.DB_PORT}`);
  console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket Server: Ready for connections`);
});

export default app;
