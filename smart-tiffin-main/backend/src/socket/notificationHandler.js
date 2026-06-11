// ============ src/socket/notificationHandler.js ============
const Notification = require('../models/Notification');

const notificationHandler = (io, socket) => {
  // Send notification
  socket.on('notification:send', async (data) => {
    try {
      const notification = await Notification.create(data);

      // Emit to recipient
      io.to(`user:${notification.recipient}`).emit('notification:new', {
        notification
      });

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });

  // Mark notification as read
  socket.on('notification:read', async (notificationId) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        {
          isRead: true,
          readAt: new Date()
        },
        { new: true }
      );

      socket.emit('notification:updated', {
        notification
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  // Mark all notifications as read
  socket.on('notifications:read:all', async () => {
    try {
      await Notification.updateMany(
        {
          recipient: socket.userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      socket.emit('notifications:all:read', {
        success: true
      });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  });

  // Get unread count
  socket.on('notifications:unread:count', async () => {
    try {
      const count = await Notification.countDocuments({
        recipient: socket.userId,
        isRead: false
      });

      socket.emit('notifications:unread:count', {
        count
      });

    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  });
};

module.exports = notificationHandler;