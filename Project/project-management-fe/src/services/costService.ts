import { api } from '../lib/api';

export const costService = {
  getAll: () => api.get('/costs'),
  getById: (id: number) => api.get(`/costs/${id}`),
  getByCategory: (category: string) => api.get(`/costs/category/${category}`),
  create: (data: any) => api.post('/costs', data),
  update: (id: number, data: any) => api.put(`/costs/${id}`, data),
  delete: (id: number) => api.delete(`/costs/${id}`),
}; 