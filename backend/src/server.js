require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

const { sequelize } = require('./database/postgres');
const { connectMongoDB } = require('./database/mongodb');
const { connectRedis } = require('./database/redis');
const logger = require('./shared/utils/logger');
const errorHandler = require('./shared/middleware/error-handler');
const { setupSwagger } = require('./config/swagger');
const routes = require('./routes');
const { initializeSocketHandlers } = require('./shared/services/socket.service');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Swagger Documentation
setupSwagger(app);

// Error handling
app.use(errorHandler);

// Socket.IO
initializeSocketHandlers(io);
app.set('io', io);

// Database connections and server start
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Connect to PostgreSQL
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
    
    // Sync models (in production, use migrations)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('Database models synchronized');
    }

    // Connect to MongoDB
    await connectMongoDB();
    logger.info('MongoDB connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Kraya-AI Backend running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await sequelize.close();
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

module.exports = { app, server, io };
