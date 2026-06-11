// ============ src/components/chat/ConversationList.jsx ============
import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { formatRelativeTime } from '../../utils/formatters';
import Input from '../common/Input';

const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="w-full md:w-96 border-r border-gray-200 flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={onSearchChange}
          icon={FiSearch}
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.conversationId}
              conversation={conversation}
              isSelected={
                selectedConversation?.conversationId === conversation.conversationId
              }
              onSelect={() => onSelectConversation(conversation)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-center">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ConversationItem = ({ conversation, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected ? 'bg-primary-50 border-l-4 border-l-primary-600' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="relative">
          <div
            className={`h-14 w-14 rounded-full ${generateAvatarColor(
              conversation.otherUser.name
            )} flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}
          >
            {getInitials(conversation.otherUser.name)}
          </div>
          {/* Online Status Indicator (optional) */}
          <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        {/* Conversation Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {conversation.otherUser.name}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatRelativeTime(conversation.lastMessage.createdAt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 truncate pr-2">
              {conversation.lastMessage.message}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;