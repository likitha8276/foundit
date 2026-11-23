const mongoose = require('mongoose');
const pino = require('pino');
const path = require('path');
const env = require('./env');

// Ensure in-memory mongo binary is stored within workspace for full sandbox read/write permissions
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(__dirname, '../../.mongo-binaries');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

let memoryServer = null;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return true;
  }

  try {
    logger.info(`Attempting to connect to MongoDB at ${env.MONGODB_URI}...`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info('Connected to MongoDB successfully.');
    return true;
  } catch (err) {
    if (process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production') {
      logger.warn(`Could not connect to external MongoDB: ${err.message}`);
      logger.warn('Production / Cloud container detected. If on Railway, ensure the MONGO_URL variable is configured.');
      return false;
    }

    logger.warn(`Could not connect to external MongoDB (${err.message}). Starting local in-memory MongoDB instance...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: { launchTimeout: 60000 }
      });
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      logger.info(`Connected to In-Memory MongoDB at ${memUri}`);
      return true;
    } catch (memErr) {
      logger.error('Failed to start In-Memory MongoDB:', memErr.message);
      return false;
    }
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    logger.error('Error disconnecting MongoDB:', err.message);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  logger
};
