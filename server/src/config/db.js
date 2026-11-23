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
  try {
    // First attempt to connect to the configured URI with a 2-second timeout
    logger.info(`Attempting to connect to MongoDB at ${env.MONGODB_URI}...`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    logger.info('Connected to MongoDB successfully.');
  } catch (err) {
    logger.warn(`Could not connect to external MongoDB (${err.message}). Starting in-memory MongoDB instance...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: { launchTimeout: 60000 }
      });
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      logger.info(`Connected to In-Memory MongoDB at ${memUri}`);
    } catch (memErr) {
      logger.error('Failed to start In-Memory MongoDB:', memErr);
      throw memErr;
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  logger
};
