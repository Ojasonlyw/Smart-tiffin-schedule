// ============ src/components/chat/MessageInput.jsx ============
import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiX } from 'react-icons/fi';
import Button from '../common/Button';
import socketService from '../../services/socketService';

const MessageInput = ({ onSendMessage, conversationId, receiverId }) => {
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [messageText]);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    // Emit typing status
    socketService.emit('typing:start', { receiverId, conversationId });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('typing:stop', { receiverId, conversationId });
    }, 1000);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    if (newAttachments[index].preview) {
      URL.revokeObjectURL(newAttachments[index].preview);
    }
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!messageText.trim() && attachments.length === 0) return;

    // Stop typing indicator
    socketService.emit('typing:stop', { receiverId, conversationId });

    // Send message
    await onSendMessage({
      message: messageText.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    // Clear input
    setMessageText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👏'];

  const insertEmoji = (emoji) => {
    setMessageText(messageText + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment.preview ? (
                <div className="relative">
                  <img
                    src={attachment.preview}
                    alt={attachment.name}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="relative h-20 w-32 bg-gray-100 rounded-lg flex items-center justify-center p-2">
                  <div className="text-center">
                    <FiPaperclip className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 truncate w-full">
                      {attachment.name}
                    </p>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => insertEmoji(emoji)}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Attach file"
          >
            <FiPaperclip className="h-5 w-5 text-gray-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add emoji"
          >
            <FiSmile className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none max-h-32"
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!messageText.trim() && attachments.length === 0}
          className="flex-shrink-0"
        >
          <FiSend className="h-5 w-5" />
        </Button>
      </form>

      <p className="text-xs text-gray-500 mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
};

export default MessageInput;