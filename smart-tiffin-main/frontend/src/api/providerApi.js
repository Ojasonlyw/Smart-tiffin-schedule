// ============ src/api/providerApi.js ============
import axiosInstance from './axios';

export const providerApi = {
  getProviders: (params) => axiosInstance.get('/providers', { params }),
  getProvider: (id) => axiosInstance.get(`/providers/${id}`),
  getNearbyProviders: (params) => axiosInstance.get('/providers/nearby', { params }),
  createProvider: (data) => axiosInstance.post('/providers', data),
  updateProvider: (id, data) => axiosInstance.put(`/providers/${id}`, data),
  deleteProvider: (id) => axiosInstance.delete(`/providers/${id}`),
  getMyProvider: () => axiosInstance.get('/providers/me/listing'),
  updateMenu: (id, data) => axiosInstance.put(`/providers/${id}/menu`, data),
  updateWeeklyMenu: (id, data) => axiosInstance.put(`/providers/${id}/weekly-menu`, data),
  updatePricing: (id, data) => axiosInstance.put(`/providers/${id}/pricing`, data),
};
