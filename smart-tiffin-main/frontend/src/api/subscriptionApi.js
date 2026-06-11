// ============ src/api/subscriptionApi.js ============
import axiosInstance from './axios';

export const subscriptionApi = {
  getSubscriptions: (params) => axiosInstance.get('/subscriptions', { params }),
  getSubscription: (id) => axiosInstance.get(`/subscriptions/${id}`),
  createSubscription: (data) => axiosInstance.post('/subscriptions', data),
  cancelSubscription: (id) => axiosInstance.put(`/subscriptions/${id}/cancel`),
  pauseSubscription: (id, data) => axiosInstance.put(`/subscriptions/${id}/pause`, data),
  resumeSubscription: (id) => axiosInstance.put(`/subscriptions/${id}/resume`),
  getProviderSubscriptions: (params) => axiosInstance.get('/subscriptions/provider/list', { params }),
};

