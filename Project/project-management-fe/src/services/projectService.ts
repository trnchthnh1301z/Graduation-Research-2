import { api } from '../lib/api';

export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id: number) => api.get(`/projects/${id}`),
  getByStatus: (status: string) => api.get(`/projects/status/${status}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: number, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};