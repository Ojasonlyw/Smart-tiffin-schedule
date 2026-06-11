// ============ src/components/chat/ChatNotification.jsx ============
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiX } from 'react-icons/fi';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import socketService from '../../services/socketService';

const ChatNotification = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.on('message:received', handleNewMessage);
    }

    return () => {
      socketService.off('message:received', handleNewMessage);
    };
  }, [isAuthenticated]);

  const handleNewMessage = (data) => {
    const notification = {
      id: data.message._id,
      sender: data.message.sender,
      message: data.message.message,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 5000);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg p-4 w-80 animate-slide-up border-l-4 border-primary-600"
        >
          <div className="flex items-start space-x-3">
            <div
              className={`h-10 w-10 rounded-full ${generateAvatarColor(
                notification.sender.name
              )} flex items-center justify-center text-white font-semibold flex-shrink-0`}
            >
              {getInitials(notification.sender.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {notification.sender.name}
                </p>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {notification.message}
              </p>
              <Link
                to="/chat"
                className="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center"
              >
                <FiMessageSquare className="h-3 w-3 mr-1" />
                View Message
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatNotification;