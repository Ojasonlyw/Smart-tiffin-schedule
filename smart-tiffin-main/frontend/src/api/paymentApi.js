// ============ src/api/paymentApi.js ============
import axiosInstance from './axios';

export const paymentApi = {
  createOrder: (data) => axiosInstance.post('/payments/create-order', data),
  verifyPayment: (data) => axiosInstance.post('/payments/verify', data),
  getPaymentHistory: (params) => axiosInstance.get('/payments/history', { params }),
};

