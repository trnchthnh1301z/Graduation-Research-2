import { api } from '../lib/api';

export const personService = {
  getAll: () => api.get('/persons'),
  getById: (id: number) => api.get(`/persons/${id}`),
  getByRole: (role: string) => api.get(`/persons/role/${role}`),
  getByEmail: (email: string) => api.get(`/persons/email/${email}`),
  create: (data: any) => api.post('/persons', data),
  update: (id: number, data: any) => api.put(`/persons/${id}`, data),
  delete: (id: number) => api.delete(`/persons/${id}`),
}; 