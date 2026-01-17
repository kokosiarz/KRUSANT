import api from '../client';

export interface Teacher {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
}

export const teachersApi = {
  getTeachers: async (): Promise<Teacher[]> => {
    return api.get<Teacher[]>('/teachers');
  },
  getTeacherById: async (id: number): Promise<Teacher> => {
    return api.get<Teacher>(`/teachers/${id}`);
  },
};
