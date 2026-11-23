const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB, logger } = require('./config/db');
const { initSocket } = require('./services/socketService');
const User = require('./models/User');
const { populateDemoData } = require('./scripts/seed');

async function startServer() {
  try {
    await connectDB();

    // Auto-seed demo data if database is fresh/empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('Empty database detected. Auto-seeding demonstration users and items...');
      await populateDemoData();
    }

    const server = http.createServer(app);
    initSocket(server, env.CLIENT_URL);

    server.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode.`);
      logger.info(`API Health endpoint: http://localhost:${env.PORT}/api/health`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
