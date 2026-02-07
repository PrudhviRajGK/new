require('dotenv').config();
const { sequelize } = require('./postgres');
const { connectMongoDB } = require('./mongodb');
const logger = require('../shared/utils/logger');

// Import all models to register them with Sequelize
require('./models');

async function migrate() {
  try {
    logger.info('Starting database migration...');

    // Connect to PostgreSQL
    await sequelize.authenticate();
    logger.info('PostgreSQL connected');

    // Sync all models (creates tables)
    await sequelize.sync({ force: false, alter: true });
    logger.info('PostgreSQL tables created/updated');

    // Connect to MongoDB (collections are created automatically)
    await connectMongoDB();
    logger.info('MongoDB connected');

    logger.info('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
