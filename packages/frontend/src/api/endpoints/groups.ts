import api from '../client';
import { Group, DateBoundary } from '../../Pages/Groups/types';

export interface CreateGroupRequest {
    startHour?: string;
    lessonLength?: string;
  name: string;
  isActive?: boolean;
  studentIds?: Array<number | string>;
  // No classIds — a class is attached to a group by setting its own groupId
  // via the Classes endpoints. The server ignores it on group writes; it is
  // still *returned* on Group (see Pages/Groups/types).
  cost: number;
  unitCost: number;
  courseId?: number | null;
  teacherId?: number | null;
  comment?: string;
  minStartDate?: DateBoundary;
  maxEndDate?: DateBoundary;
  colorHex?: string;
}

export interface UpdateGroupRequest {
    startHour?: string;
    lessonLength?: string;
  name?: string;
  isActive?: boolean;
  studentIds?: Array<number | string>;
  // No classIds — a class is attached to a group by setting its own groupId
  // via the Classes endpoints. The server ignores it on group writes; it is
  // still *returned* on Group (see Pages/Groups/types).
  cost?: number;
  unitCost?: number;
  courseId?: number | null;
  teacherId?: number | null;
  comment?: string;
  minStartDate?: DateBoundary;
  maxEndDate?: DateBoundary;
  colorHex?: string;
}

export const groupsApi = {
  getGroups: async (): Promise<Group[]> => {
    return api.get<Group[]>('/groups');
  },
  getGroupById: async (id: number): Promise<Group> => {
    return api.get<Group>(`/groups/${id}`);
  },
  createGroup: async (data: CreateGroupRequest): Promise<Group> => {
    return api.post<Group>('/groups', data);
  },
  updateGroup: async (id: number, data: UpdateGroupRequest): Promise<Group> => {
    return api.patch<Group>(`/groups/${id}`, data);
  },
  deleteGroup: async (id: number): Promise<void> => {
    return api.delete<void>(`/groups/${id}`);
  },
};
