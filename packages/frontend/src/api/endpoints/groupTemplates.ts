import api from '../client';
import { GroupTemplate, DateBoundary } from '../../Components/Pages/GroupTemplates/types';

export interface CreateGroupTemplateRequest {
  templateName: string;
  isActive?: boolean;
  studentIds?: Array<number | string>;
  classIds?: Array<number | string>;
  cost: number;
  unitCost: number;
  teacherId?: number;
  comment?: string;
  minStartDate?: DateBoundary;
  maxEndDate?: DateBoundary;
  startHour?: string;
  lessonLength?: string;
  roomId?: number;
  courseId?: number;
  colorHex?: string;
}

export interface UpdateGroupTemplateRequest {
  templateName?: string;
  isActive?: boolean;
  studentIds?: Array<number | string>;
  classIds?: Array<number | string>;
  cost?: number;
  unitCost?: number;
  teacherId?: number;
  comment?: string;
  minStartDate?: DateBoundary;
  maxEndDate?: DateBoundary;
  startHour?: string;
  lessonLength?: string;
  roomId?: number;
  courseId?: number;
  colorHex?: string;
}

export const groupTemplatesApi = {
  getGroupTemplates: async (): Promise<GroupTemplate[]> => {
    return api.get<GroupTemplate[]>('/group-templates');
  },
  getGroupTemplateById: async (id: number): Promise<GroupTemplate> => {
    return api.get<GroupTemplate>(`/group-templates/${id}`);
  },
  createGroupTemplate: async (data: CreateGroupTemplateRequest): Promise<GroupTemplate> => {
    return api.post<GroupTemplate>('/group-templates', data);
  },
  updateGroupTemplate: async (id: number, data: UpdateGroupTemplateRequest): Promise<GroupTemplate> => {
    return api.patch<GroupTemplate>(`/group-templates/${id}`, data);
  },
  deleteGroupTemplate: async (id: number): Promise<void> => {
    return api.delete<void>(`/group-templates/${id}`);
  },
};
