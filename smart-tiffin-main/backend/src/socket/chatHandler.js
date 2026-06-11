// ============ src/socket/chatHandler.js ============
const ChatMessage = require('../models/ChatMessage');

const chatHandler = (io, socket) => {
  // Join a conversation room
  socket.on('join:conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave a conversation room
  socket.on('leave:conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Send message
  socket.on('message:send', async (data) => {
    try {
      const { receiverId, message, messageType, attachments } = data;

      const conversationId = ChatMessage.createConversationId(socket.userId, receiverId);

      // Create message in database
      const chatMessage = await ChatMessage.create({
        sender: socket.userId,
        receiver: receiverId,
        conversationId,
        message,
        messageType: messageType || 'text',
        attachments: attachments || []
      });

      await chatMessage.populate('sender receiver', 'name avatar role');

      // Emit to sender
      socket.emit('message:sent', {
        success: true,
        message: chatMessage
      });

      // Emit to receiver if online
      io.to(`user:${receiverId}`).emit('message:received', {
        message: chatMessage
      });

      // Emit to conversation room
      io.to(`conversation:${conversationId}`).emit('message:new', {
        message: chatMessage
      });

    } catch (error) {
      socket.emit('message:error', {
        success: false,
        message: error.message
      });
    }
  });

  // Typing indicator
  socket.on('typing:start', ({ receiverId, conversationId }) => {
    io.to(`user:${receiverId}`).emit('typing:user', {
      userId: socket.userId,
      conversationId,
      isTyping: true
    });
  });

  socket.on('typing:stop', ({ receiverId, conversationId }) => {
    io.to(`user:${receiverId}`).emit('typing:user', {
      userId: socket.userId,
      conversationId,
      isTyping: false
    });
  });

  // Mark messages as read
  socket.on('messages:read', async ({ conversationId, messageIds }) => {
    try {
      await ChatMessage.updateMany(
        {
          _id: { $in: messageIds },
          receiver: socket.userId
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      // Notify sender
      const messages = await ChatMessage.find({ _id: { $in: messageIds } });
      const senderIds = [...new Set(messages.map(m => m.sender.toString()))];

      senderIds.forEach(senderId => {
        io.to(`user:${senderId}`).emit('messages:read', {
          conversationId,
          messageIds,
          readBy: socket.userId
        });
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });
};

module.exports = chatHandler;

