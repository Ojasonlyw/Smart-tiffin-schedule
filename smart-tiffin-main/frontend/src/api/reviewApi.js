// ============ src/api/reviewApi.js ============
import axiosInstance from './axios';

export const reviewApi = {
  getProviderReviews: (providerId, params) => 
    axiosInstance.get(`/reviews/provider/${providerId}`, { params }),
  createReview: (data) => axiosInstance.post('/reviews', data),
  updateReview: (id, data) => axiosInstance.put(`/reviews/${id}`, data),
  deleteReview: (id) => axiosInstance.delete(`/reviews/${id}`),
  markHelpful: (id) => axiosInstance.put(`/reviews/${id}/helpful`),
  addProviderResponse: (id, data) => axiosInstance.put(`/reviews/${id}/response`, data),
};

