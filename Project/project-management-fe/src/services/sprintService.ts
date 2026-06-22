import { api } from '../lib/api';

export const sprintService = {
  getAll: () => api.get('/sprints'),
  getById: (id: number) => api.get(`/sprints/${id}`),
  getByProjectId: (projectId: number) => api.get(`/sprints/project/${projectId}`),
  create: (data: any) => api.post('/sprints', data),
  update: (id: number, data: any) => api.put(`/sprints/${id}`, data),
  delete: (id: number) => api.delete(`/sprints/${id}`),
  start: (id: number) => api.post(`/sprints/${id}/start`),
  complete: (id: number) => api.post(`/sprints/${id}/complete`),
  completeWithTarget: (id: number, targetSprintId: number) => api.post(`/sprints/${id}/complete/${targetSprintId}`),
}; 