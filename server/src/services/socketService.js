let ioInstance = null;

function initSocket(server, clientUrl) {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // User joins a personal room identified by their user ID
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('leave', (userId) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });
  });

  ioInstance = io;
  return io;
}

function getIO() {
  return ioInstance;
}

function emitToUser(userId, event, payload) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  }
}

function emitBroadcast(event, payload) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitBroadcast
};
