import api from '../client';

export const debitsApi = {
  getAll: () => api.get('/debits'),
  getById: (id: number) => api.get(`/debits/${id}`),
  create: (data: any) => api.post('/debits', data),
  update: (id: number, data: any) => api.put(`/debits/${id}`, data),
  remove: (id: number) => api.delete(`/debits/${id}`),
};
