// ============ src/api/chatApi.js ============
import axiosInstance from './axios';

export const chatApi = {
  getConversations: () => axiosInstance.get('/chat/conversations'),
  getMessages: (conversationId, params) => 
    axiosInstance.get(`/chat/${conversationId}`, { params }),
  sendMessage: (data) => axiosInstance.post('/chat/send', data),
  deleteMessage: (messageId) => axiosInstance.delete(`/chat/${messageId}`),
  reportMessage: (messageId, data) => axiosInstance.put(`/chat/${messageId}/report`, data),
};

