import api from '../client';

export interface Teacher {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
}

export interface CreateTeacherRequest {
  name: string;
  email: string;
}

export type UpdateTeacherRequest = Partial<CreateTeacherRequest>;

export const teachersApi = {
  getTeachers: async (): Promise<Teacher[]> => {
    return api.get<Teacher[]>('/teachers');
  },
  getTeacherById: async (id: number): Promise<Teacher> => {
    return api.get<Teacher>(`/teachers/${id}`);
  },
  createTeacher: async (data: CreateTeacherRequest): Promise<Teacher> => {
    return api.post<Teacher>('/teachers', data);
  },
  updateTeacher: async (id: number, data: UpdateTeacherRequest): Promise<Teacher> => {
    return api.patch<Teacher>(`/teachers/${id}`, data);
  },
  deleteTeacher: async (id: number): Promise<void> => {
    return api.delete<void>(`/teachers/${id}`);
  },
};
