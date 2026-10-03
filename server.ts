import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes/apiRoutes.js';
import { connectDB } from './server/config/db.js';
import { seedDevelopmentData } from './server/seed/devSeed.js';
import { errorHandler } from './server/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { setSocketIO } from './server/config/socket.js';

const app = express();
const server = http.createServer(app);

// Socket.io for Real-time Chat & Notifications
export const ioInstance = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setSocketIO(ioInstance);

ioInstance.on('connection', (socket) => {
  // Join a specific conversation room
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(conversationId);
  });

  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(conversationId);
  });

  // Client or therapist typing indicator
  socket.on('typing', ({ conversationId, senderName }: { conversationId: string; senderName: string }) => {
    socket.to(conversationId).emit('user_typing', { senderName });
  });

  socket.on('stop_typing', ({ conversationId }: { conversationId: string }) => {
    socket.to(conversationId).emit('user_stop_typing');
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API routes
app.use('/api', apiRouter);

// Centralized API error handler
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  try {
    // 1. Initialize Database connection (Atlas or resilient in-memory fallback)
    await connectDB();

    // 2. Initialize Seed data for development/demo inspectability
    await seedDevelopmentData();

    // 3. Mount Frontend: Vite middleware in dev, static files in production
    const isProd = process.env.NODE_ENV === 'production';

    if (!isProd) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== 'true',
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('[UNLOX] Vite middleware attached in development mode.');
    } else {
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    }

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`  ANVAY Practice Management Server running on port ${PORT}`);
      console.log(`  Platform: Full-Stack React + Express + Socket.io`);
      console.log(`  Dev URL:  http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start UNLOX server:', err);
    process.exit(1);
  }
}

startServer();
