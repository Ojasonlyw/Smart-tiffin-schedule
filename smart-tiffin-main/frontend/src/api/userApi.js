// ============ src/api/userApi.js ============
import axiosInstance from './axios';

export const userApi = {
  getProfile: () => axiosInstance.get('/users/profile'),
  updateProfile: (data) => axiosInstance.put('/users/profile', data),
  getFavorites: () => axiosInstance.get('/users/favorites'),
  toggleFavorite: (providerId) => axiosInstance.put(`/users/favorites/${providerId}`),
};


