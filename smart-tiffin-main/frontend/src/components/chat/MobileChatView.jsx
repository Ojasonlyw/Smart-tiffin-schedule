// ============ src/components/chat/MobileChatView.jsx ============
import React, { useState } from 'react';
import { FiArrowLeft, FiMenu } from 'react-icons/fi';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';

const MobileChatView = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  onSendMessage,
  isTyping,
}) => {
  const [showConversations, setShowConversations] = useState(true);

  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation);
    setShowConversations(false); // Hide list on mobile
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white md:hidden">
      {/* Mobile: Toggle between list and chat */}
      {showConversations ? (
        <div className="w-full">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>
      ) : (
        <div className="w-full flex flex-col">
          {/* Back button */}
          <div className="px-4 py-3 border-b flex items-center space-x-3 bg-white">
            <button
              onClick={() => setShowConversations(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedConversation?.otherUser.name}
            </h2>
          </div>

          {/* Chat Window */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow
              conversation={selectedConversation}
              onSendMessage={onSendMessage}
              isTyping={isTyping}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileChatView;