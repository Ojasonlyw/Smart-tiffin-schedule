// ============ src/components/chat/MessageList.jsx ============
import React from 'react';
import { useSelector } from 'react-redux';
import { FiCheck, FiCheckCircle, FiImage, FiFile } from 'react-icons/fi';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import { formatRelativeTime } from '../../utils/formatters';

const MessageList = ({ conversation, userId }) => {
  const { messages } = useSelector((state) => state.chat);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p>No messages yet</p>
          <p className="text-sm mt-1">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => {
        const isSent = message.sender._id === userId;
        return (
          <MessageBubble
            key={message._id}
            message={message}
            isSent={isSent}
          />
        );
      })}
    </div>
  );
};

const MessageBubble = ({ message, isSent }) => {
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isSent ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-lg`}>
        {/* Avatar for received messages */}
        {!isSent && (
          <div
            className={`h-8 w-8 rounded-full ${generateAvatarColor(
              message.sender.name
            )} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
          >
            {getInitials(message.sender.name)}
          </div>
        )}

        {/* Message Content */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isSent
              ? 'bg-primary-600 text-white rounded-br-none'
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
          } ${isSent ? 'ml-2' : 'mr-2'}`}
        >
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2">
              {message.attachments.map((attachment, index) => (
                <AttachmentPreview key={index} attachment={attachment} isSent={isSent} />
              ))}
            </div>
          )}

          {/* Message Text */}
          <p className="text-sm break-words whitespace-pre-wrap">{message.message}</p>

          {/* Timestamp and Status */}
          <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
            isSent ? 'text-primary-100' : 'text-gray-500'
          }`}>
            <span>{formatRelativeTime(message.createdAt)}</span>
            {isSent && (
              <span>
                {message.isRead ? (
                  <FiCheckCircle className="h-3 w-3" />
                ) : (
                  <FiCheck className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AttachmentPreview = ({ attachment, isSent }) => {
  const isImage = attachment.type?.startsWith('image/');

  if (isImage) {
    return (
      <div className="mb-2 rounded-lg overflow-hidden">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-w-xs rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-lg ${
      isSent ? 'bg-primary-700' : 'bg-gray-100'
    }`}>
      <FiFile className="h-5 w-5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs">{formatFileSize(attachment.size)}</p>
      </div>
    </div>
  );
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default MessageList;