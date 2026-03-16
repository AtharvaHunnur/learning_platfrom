import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import next from 'next';
import { parse } from 'url';
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

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 8000;

nextApp.prepare().then(async () => {
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/admin/stats', analyticsRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/ai', aiRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Global API Error Handler
  app.use('/api', errorHandler);

  // Default Catch-all (Next.js handling)
  app.use((req, res) => {
    const parsedUrl = parse(req.url!, true);
    return handle(req, res, parsedUrl);
  });

  try {
    console.log('Starting server...');
    
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port} (Next.js + Express API)`);
    });

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
});

// Global exception handlers
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
