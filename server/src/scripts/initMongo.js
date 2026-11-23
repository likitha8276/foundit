const path = require('path');
process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(__dirname, '../../.mongo-binaries');

const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  console.log('Verifying MongoDB Memory Server binary with 60s launch timeout...');
  const server = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 60000
    }
  });
  console.log('MongoDB Memory Server running successfully at:', server.getUri());
  await server.stop();
  console.log('Workspace MongoDB binary cache verification complete.');
}

main().catch((err) => {
  console.error('Failed to initialize MongoDB Memory Server:', err);
  process.exit(1);
});
