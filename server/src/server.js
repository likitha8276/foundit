const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const env = require('./config/env');
const { connectDB, logger } = require('./config/db');
const { initSocket } = require('./services/socketService');
const User = require('./models/User');
const { populateDemoData } = require('./scripts/seed');

async function seedIfEmpty() {
  try {
    if (mongoose.connection.readyState >= 1) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        logger.info('Empty database detected. Auto-seeding demonstration users and items...');
        await populateDemoData();
      }
    }
  } catch (err) {
    logger.warn(`Auto-seeding check skipped: ${err.message}`);
  }
}

async function startServer() {
  const server = http.createServer(app);
  initSocket(server, env.CLIENT_URL);

  // Listen immediately on PORT so cloud host health checks (Railway, Render) pass without crashing
  server.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    logger.info(`API Health endpoint: http://localhost:${env.PORT}/api/health`);
  });

  // Attempt database connection in the background
  const connected = await connectDB();
  if (connected) {
    await seedIfEmpty();
  } else {
    logger.warn('Initial MongoDB connection not established. Retrying in background every 10 seconds...');
    const retryInterval = setInterval(async () => {
      if (mongoose.connection.readyState >= 1) {
        clearInterval(retryInterval);
        return;
      }
      logger.info('Retrying MongoDB connection...');
      const reconnected = await connectDB();
      if (reconnected) {
        logger.info('MongoDB connected on retry!');
        await seedIfEmpty();
        clearInterval(retryInterval);
      }
    }, 10000);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
