// Socket.IO manager to avoid circular dependencies
let io = null;

const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

const getSocketIO = () => {
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  setSocketIO,
  getSocketIO,
  emitToUser,
  emitToAll
};