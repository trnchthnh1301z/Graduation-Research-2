import { api } from '../lib/api';

export const costAssignmentService = {
  getAll: () => api.get('/cost-assignments'),
  getById: (id: number) => api.get(`/cost-assignments/${id}`),
  getByCostId: (costId: number) => api.get(`/cost-assignments/cost/${costId}`),
  getByEpicId: (epicId: number) => api.get(`/cost-assignments/epic/${epicId}`),
  getByWorkItemId: (workItemId: number) => api.get(`/cost-assignments/work-item/${workItemId}`),
  create: (data: any) => api.post('/cost-assignments', data),
  update: (id: number, data: any) => api.put(`/cost-assignments/${id}`, data),
  delete: (id: number) => api.delete(`/cost-assignments/${id}`),
}; 