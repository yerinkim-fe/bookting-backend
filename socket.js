module.exports = io => {
  io.on('connection', socket => {
    socket.on('error', error => {
      console.error(error);
    });

    socket.on('requestChat', chat_id => {
      // socket.broadcast.to(chat_id).emit('join');
      socket.join(chat_id);
    });

    socket.on('sendMessage', (message, author, chat_id) => {
      io.to(chat_id).emit('receivedMessage', message, author);
    });
  });
}
