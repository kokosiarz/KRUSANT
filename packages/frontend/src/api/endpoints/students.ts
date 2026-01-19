import api from '../client';
import { Student, StudentWithBalance } from '../../Pages/Students/types';

export interface CreateStudentRequest {
  name: string;
  email: string;
  phone?: string;
  payments: any[];
  classes: any[];
  customRate?: number;
  discount?: number;
  semester: string;
  extraNotes: string;
  active: boolean;
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  phone?: string;
  payments?: any[];
  classes?: any[];
  customRate?: number;
  discount?: number;
  semester?: string;
  extraNotes?: string;
  active?: boolean;
}

/**
 * Students management API endpoints
 */
export const studentsApi = {
  /**
   * Get all students
   */
  getStudents: async (): Promise<Student[]> => {
    return api.get<Student[]>('/students');
  },

  /**
   * Get all students with balance
   */
  getStudentsWithBalance: async (): Promise<StudentWithBalance[]> => {
    return api.get<StudentWithBalance[]>('/students/with-balance');
  },

  /**
   * Get student by ID
   */
  getStudentById: async (id: number): Promise<Student> => {
    return api.get<Student>(`/students/${id}`);
  },

  /**
   * Create new student
   */
  createStudent: async (data: CreateStudentRequest): Promise<Student> => {
    return api.post<Student>('/students', data);
  },

  /**
   * Update student
   */
  updateStudent: async (id: number, data: UpdateStudentRequest): Promise<Student> => {
    return api.patch<Student>(`/students/${id}`, data);
  },

  /**
   * Delete student
   */
  deleteStudent: async (id: number): Promise<void> => {
    return api.delete<void>(`/students/${id}`);
  },

  /**
   * Search student by email
   */
  searchStudentByEmail: async (email: string): Promise<Student> => {
    return api.get<Student>(`/students/search?email=${encodeURIComponent(email)}`);
  },
};

