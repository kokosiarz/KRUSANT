import api from '../client';
import { GroupTemplate, DateBoundary } from '../../Pages/GroupTemplates/types';

// Templates are stored in the `group` table behind an `isTemplate` flag —
// there is no separate group-templates endpoint any more. "Template" is still
// a real concept in the UI, so this adapter keeps that vocabulary (and the
// templateName field) while talking to /groups underneath.

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

export type UpdateGroupTemplateRequest = Partial<CreateGroupTemplateRequest>;

/** Group row (name) -> the template shape the UI works with (templateName). */
const toTemplate = (group: any): GroupTemplate => {
  const { name, isTemplate, ...rest } = group;
  return { ...rest, templateName: name } as GroupTemplate;
};

/** Template payload (templateName) -> group payload (name + isTemplate). */
const toGroupPayload = (
  data: CreateGroupTemplateRequest | UpdateGroupTemplateRequest,
) => {
  const { templateName, ...rest } = data;
  return {
    ...rest,
    ...(templateName !== undefined ? { name: templateName } : {}),
    isTemplate: true,
  };
};

export const groupTemplatesApi = {
  getGroupTemplates: async (): Promise<GroupTemplate[]> => {
    const groups = await api.get<any[]>('/groups?isTemplate=true');
    return groups.map(toTemplate);
  },
  getGroupTemplateById: async (id: number): Promise<GroupTemplate> => {
    return toTemplate(await api.get<any>(`/groups/${id}`));
  },
  createGroupTemplate: async (data: CreateGroupTemplateRequest): Promise<GroupTemplate> => {
    return toTemplate(await api.post<any>('/groups', toGroupPayload(data)));
  },
  updateGroupTemplate: async (id: number, data: UpdateGroupTemplateRequest): Promise<GroupTemplate> => {
    return toTemplate(await api.patch<any>(`/groups/${id}`, toGroupPayload(data)));
  },
  deleteGroupTemplate: async (id: number): Promise<void> => {
    return api.delete<void>(`/groups/${id}`);
  },
};
