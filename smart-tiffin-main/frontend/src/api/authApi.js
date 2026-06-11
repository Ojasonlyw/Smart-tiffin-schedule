// ============ src/api/authApi.js ============
import axiosInstance from './axios';

export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  getMe: () => axiosInstance.get('/auth/me'),
  updatePassword: (data) => axiosInstance.put('/auth/updatepassword', data),
  logout: () => axiosInstance.post('/auth/logout'),
};

