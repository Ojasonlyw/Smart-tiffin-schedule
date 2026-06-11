// ============ src/components/chat/UnreadChatBadge.jsx ============
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../../redux/slices/chatSlice';
import socketService from '../../services/socketService';

const UnreadChatBadge = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { conversations } = useSelector((state) => state.chat);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const unreadCount = conversations.reduce(
    (total, conv) => total + conv.unreadCount,
    0
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchConversations());

      // Listen for new messages to update badge
      socketService.on('message:received', () => {
        dispatch(fetchConversations());
      });
    }

    return () => {
      socketService.off('message:received');
    };
  }, [isAuthenticated, dispatch]);

  if (unreadCount === 0) return null;

  return (
    <span
      className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${className}`}
    >
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};

export default UnreadChatBadge;