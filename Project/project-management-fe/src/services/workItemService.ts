import { api } from '../lib/api';

export const workItemService = {
  getAll: () => api.get('/work-items'),
  getById: (id: number) => api.get(`/work-items/${id}`),
  getByProjectId: (projectId: number) => api.get(`/work-items/project/${projectId}`),
  getByEpicId: (epicId: number) => api.get(`/work-items/epic/${epicId}`),
  getBySprintId: (sprintId: number) => api.get(`/work-items/sprint/${sprintId}`),
  create: (data: any) => api.post('/work-items', data),
  update: (id: number, data: any) => api.put(`/work-items/${id}`, data),
  delete: (id: number) => api.delete(`/work-items/${id}`),
}; 