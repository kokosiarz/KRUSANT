import api from '../client';

export const paymentsApi = {
  getAll: () => api.get('/payments'),
  getById: (id: number) => api.get(`/payments/${id}`),
  getByStudent: (studentId: number) => api.get(`/payments/student/${studentId}`),
  create: (data: any) => api.post('/payments', data),
  update: (id: number, data: any) => api.put(`/payments/${id}`, data),
  remove: (id: number) => api.delete(`/payments/${id}`),
};
