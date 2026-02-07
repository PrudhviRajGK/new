const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const connectedUsers = new Map();

const initializeSocketHandlers = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.tenantId = decoded.tenantId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} for user: ${socket.userId}`);
    
    connectedUsers.set(socket.userId, socket.id);
    socket.join(`tenant:${socket.tenantId}`);

    socket.on('join:conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.userId);
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const emitToUser = (io, userId, event, data) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

const emitToTenant = (io, tenantId, event, data) => {
  io.to(`tenant:${tenantId}`).emit(event, data);
};

const emitToConversation = (io, conversationId, event, data) => {
  io.to(`conversation:${conversationId}`).emit(event, data);
};

module.exports = {
  initializeSocketHandlers,
  emitToUser,
  emitToTenant,
  emitToConversation
};
