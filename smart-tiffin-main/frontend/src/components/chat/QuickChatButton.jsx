// ============ src/components/chat/QuickChatButton.jsx - FIXED ============
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiMessageSquare, FiX } from 'react-icons/fi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { chatApi } from '../../api/chatApi';
import { providerApi } from '../../api/providerApi';
import { toast } from 'react-toastify';

const QuickChatButton = ({ providerId, providerName }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [providerOwnerId, setProviderOwnerId] = useState(null);

  // Fetch provider details to get owner ID when modal opens
  const handleOpenModal = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setShowModal(true);
    
    // Fetch provider details if we don't have owner ID yet
    if (!providerOwnerId) {
      try {
        const response = await providerApi.getProvider(providerId);
        setProviderOwnerId(response.data.provider.owner._id || response.data.provider.owner);
      } catch (error) {
        console.error('Failed to fetch provider details:', error);
        toast.error('Failed to load provider details');
        setShowModal(false);
      }
    }
  };

  const handleQuickChat = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!providerOwnerId) {
      toast.error('Failed to get provider information. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await chatApi.sendMessage({
        receiverId: providerOwnerId, // Use owner's user ID instead of provider ID
        message: message.trim(),
        messageType: 'text',
      });

      toast.success('Message sent successfully!');
      setShowModal(false);
      setMessage('');
      
      // Navigate to chat page
      setTimeout(() => {
        navigate('/chat', { state: { userId: providerOwnerId } });
      }, 500);
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpenModal}
      >
        <FiMessageSquare className="mr-2" />
        Quick Chat
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Message ${providerName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in your tiffin service..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Mention your meal preferences, dietary restrictions, 
              or any questions about their service.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              fullWidth
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleQuickChat} loading={loading}>
              Send Message
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QuickChatButton;