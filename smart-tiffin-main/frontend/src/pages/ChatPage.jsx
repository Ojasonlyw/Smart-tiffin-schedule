// ============ src/pages/ChatPage.jsx - FIXED (No Duplicate Messages) ============
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchConversations, fetchMessages, sendMessage, addMessage } from '../redux/slices/chatSlice';
import socketService from '../services/socketService';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const ChatPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { conversations, loading } = useSelector((state) => state.chat);
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState([]);

  // Initialize socket and load conversations
  useEffect(() => {
    if (isAuthenticated && token) {
      // Ensure socket is connected
      if (!socketService.socket) {
        socketService.connect(token);
      }
      
      dispatch(fetchConversations());
      
      // Setup socket listeners
      socketService.on('message:received', handleNewMessage);
      socketService.on('typing:user', handleTyping);
    }

    return () => {
      socketService.off('message:received', handleNewMessage);
      socketService.off('typing:user', handleTyping);
    };
  }, [isAuthenticated, token, dispatch]);

  // Handle provider/user ID from navigation state (when clicking chat from provider details or quick chat)
  useEffect(() => {
    const targetUserId = location.state?.providerId || location.state?.userId;
    if (targetUserId && conversations.length > 0) {
      const targetConversation = conversations.find(
        (conv) => conv.otherUser._id === targetUserId
      );
      if (targetConversation) {
        handleSelectConversation(targetConversation);
      }
    }
  }, [location.state, conversations]);

  // Filter conversations based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter((conv) =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const handleNewMessage = (data) => {
    // Only add message if it's from another user (not our sent message)
    if (data.message.sender._id !== user._id) {
      dispatch(addMessage(data.message));
      
      // Show notification if message is not from current conversation
      if (selectedConversation?.conversationId !== data.message.conversationId) {
        toast.info(`New message from ${data.message.sender.name}`, {
          autoClose: 3000,
        });
      }
    }
    
    // Refresh conversations to update last message
    dispatch(fetchConversations());
  };

  const handleTyping = (data) => {
    if (data.conversationId === selectedConversation?.conversationId) {
      setIsTyping(data.isTyping);
      if (data.isTyping) {
        setTimeout(() => setIsTyping(false), 3000);
      }
    }
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Load messages for this conversation
    await dispatch(
      fetchMessages({ conversationId: conversation.conversationId })
    );
    
    // Join conversation room
    socketService.emit('join:conversation', conversation.conversationId);
    
    // Mark messages as read
    const unreadMessageIds = conversation.unreadCount > 0 
      ? [] // You would need to get actual unread message IDs
      : [];
    
    if (unreadMessageIds.length > 0) {
      socketService.emit('messages:read', {
        conversationId: conversation.conversationId,
        messageIds: unreadMessageIds,
      });
    }
  };

  const handleSendMessage = async (messageData) => {
    if (!selectedConversation) return;

    try {
      const payload = {
        receiverId: selectedConversation.otherUser._id,
        message: messageData.message,
        messageType: messageData.attachments ? 'file' : 'text',
        attachments: messageData.attachments || [],
      };

      // Send through API only - socket will handle real-time delivery via backend
      const result = await dispatch(sendMessage(payload));
      
      // Only add to UI if API call was successful
      if (result.type === 'chat/sendMessage/fulfilled') {
        // Message already added via Redux fulfilled case, no need to add again
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    }
  };

  if (loading && conversations.length === 0) {
    return <Loader fullScreen />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Conversations Sidebar */}
      <ConversationList
        conversations={filteredConversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Chat Window */}
      <ChatWindow
        conversation={selectedConversation}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />
    </div>
  );
};

export default ChatPage;