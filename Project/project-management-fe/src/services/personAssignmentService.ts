import { api } from '../lib/api';

export const personAssignmentService = {
  getAll: () => api.get('/person-assignments'),
  getById: (id: number) => api.get(`/person-assignments/${id}`),
  getByPersonId: (personId: number) => api.get(`/person-assignments/person/${personId}`),
  getByEpicId: (epicId: number) => api.get(`/person-assignments/epic/${epicId}`),
  getByWorkItemId: (workItemId: number) => api.get(`/person-assignments/work-item/${workItemId}`),
  create: (data: any) => api.post('/person-assignments', data),
  update: (id: number, data: any) => api.put(`/person-assignments/${id}`, data),
  delete: (id: number) => api.delete(`/person-assignments/${id}`),
}; 