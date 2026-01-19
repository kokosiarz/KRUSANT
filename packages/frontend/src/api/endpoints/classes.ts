import api from '../client';



export interface CreateClassRequest {
  groupId?: number;
  startTime: string;
  lessonLength: string; // HH:mm format
  teacherId?: number;
  roomId?: number;
  plannedStudentsIds?: number[];
  attendedStudentsIds?: number[];
  cost: number;
  comment?: string;
}



export interface Class {
  id: number;
  groupId?: number;
  startTime: string;
  lessonLength: string; // HH:mm format
  teacherId?: number;
  roomId?: number;
  plannedStudentsIds?: number[];
  attendedStudentsIds?: number[];
  cost: number;
  comment?: string;
}

export const classesApi = {
  getClasses: async (): Promise<Class[]> => {
    return api.get<Class[]>('/classes');
  },
  getClassById: async (id: number): Promise<Class> => {
    return api.get<Class>(`/classes/${id}`);
  },
  createClass: async (data: CreateClassRequest): Promise<Class> => {
    return api.post<Class>('/classes', data);
  },
  updateClass: async (id: number, data: Partial<CreateClassRequest>): Promise<Class> => {
    return api.patch<Class>(`/classes/${id}`, data);
  },

  /**
   * Batch create classes
   * @param data Array of CreateClassRequest
   */
  batchCreateClasses: async (data: CreateClassRequest[]): Promise<Class[]> => {
    return api.post<Class[]>('/classes/batch', data);
  },
  deleteClass: async (id: number): Promise<void> => {
    return api.delete<void>(`/classes/${id}`);
  },
  setAttendance: async (classId: number, attendedStudentsIds: number[]): Promise<Class> => {
    return api.post<Class>(`/classes/${classId}/attendance`, attendedStudentsIds);
  },
};
