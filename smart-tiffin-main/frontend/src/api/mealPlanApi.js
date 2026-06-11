// ============ src/api/mealPlanApi.js ============
import axiosInstance from './axios';

export const mealPlanApi = {
  getMealPlans: (params) => axiosInstance.get('/mealplans', { params }),
  getMealPlan: (id) => axiosInstance.get(`/mealplans/${id}`),
  createMealPlan: (data) => axiosInstance.post('/mealplans', data),
  updateMealPlan: (id, data) => axiosInstance.put(`/mealplans/${id}`, data),
  deleteMealPlan: (id) => axiosInstance.delete(`/mealplans/${id}`),
  toggleFavorite: (id) => axiosInstance.put(`/mealplans/${id}/favorite`),
};

