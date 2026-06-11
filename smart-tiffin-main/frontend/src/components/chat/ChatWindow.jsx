// ============ src/components/chat/ChatWindow.jsx ============
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FiMoreVertical, FiPhone, FiVideo } from 'react-icons/fi';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { getInitials, generateAvatarColor } from '../../utils/helpers';

const ChatWindow = ({ conversation, onSendMessage, isTyping }) => {
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Select a Conversation
          </h3>
          <p className="text-gray-500">
            Choose a conversation from the left to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`h-12 w-12 rounded-full ${generateAvatarColor(
              conversation.otherUser.name
            )} flex items-center justify-center text-white font-semibold flex-shrink-0`}
          >
            {getInitials(conversation.otherUser.name)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {conversation.otherUser.name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {conversation.otherUser.role}
              {isTyping && <span className="text-primary-600 ml-2">typing...</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Voice Call">
            <FiPhone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Video Call">
            <FiVideo className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More Options">
            <FiMoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <MessageList conversation={conversation} userId={user._id} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        conversationId={conversation.conversationId}
        receiverId={conversation.otherUser._id}
      />
    </div>
  );
};

export default ChatWindow;