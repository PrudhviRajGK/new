const mongoose = require('mongoose');
const logger = require('../shared/utils/logger');

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kraya';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
};

module.exports = { connectMongoDB, mongoose };
