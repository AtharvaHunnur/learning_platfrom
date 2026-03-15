import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import { errorHandler } from './middleware/errorMiddleware';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import courseRoutes from './routes/courses';
import contentRoutes from './routes/content';
import progressRoutes from './routes/progress';
import analyticsRoutes from './routes/analytics';
import paymentRoutes from './routes/payments';
import settingsRoutes from './routes/settings';
import aiRoutes from './routes/ai';

// Fix for BigInt JSON serialization error
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin/stats', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Global Error Handler - Must be after all routes
app.use(errorHandler);

async function startServer() {
  try {
    console.log('Starting server...');
    
    // 1. Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 2. Start listening
    const server = app.listen(port, () => {
      console.log(`🚀 Backend Server running on port ${port}`);
    });

    // 3. Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        await prisma.$disconnect();
        console.log('Database connection closed.');
        process.exit(0);
      });
      
      // Force exit after 10s if shutdown hangs
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Global exception handlers for things outside of express
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export the app for Vercel serverless functions
export default app;

// Only start the server if we are running in a non-serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}
