import api from '../client';
import { Course, CoursePattern } from '../types/course';

export interface CreateCourseRequest {
  name: string;
  description?: string;
  cost: number;
  numberOfHours: number;
  lessonLength: string;
  pattern: CoursePattern;
}

export type UpdateCourseRequest = Partial<CreateCourseRequest>;

export const coursesApi = {
  getCourses: async (): Promise<Course[]> => {
    return api.get<Course[]>('/courses');
  },
  getCourseById: async (id: number): Promise<Course> => {
    return api.get<Course>(`/courses/${id}`);
  },
  createCourse: async (data: CreateCourseRequest): Promise<Course> => {
    return api.post<Course>('/courses', data);
  },
  updateCourse: async (id: number, data: UpdateCourseRequest): Promise<Course> => {
    return api.patch<Course>(`/courses/${id}`, data);
  },
  deleteCourse: async (id: number): Promise<void> => {
    return api.delete<void>(`/courses/${id}`);
  },
};
