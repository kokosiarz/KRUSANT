import api from '../client';
import { Course } from '../types/course';

export const coursesApi = {
  getCourses: async (): Promise<Course[]> => {
    return api.get<Course[]>('/courses');
  },
  getCourseById: async (id: number): Promise<Course> => {
    return api.get<Course>(`/courses/${id}`);
  },
};
