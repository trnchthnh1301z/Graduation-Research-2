import { api } from '../lib/api';

export const epicService = {
  getAll: () => api.get('/epics'),
  getById: (id: number) => api.get(`/epics/${id}`),
  getByProjectId: (projectId: number) => api.get(`/epics/project/${projectId}`),
  create: (data: any) => api.post('/epics', data),
  update: (id: number, data: any) => api.put(`/epics/${id}`, data),
  delete: (id: number) => api.delete(`/epics/${id}`),
}; 