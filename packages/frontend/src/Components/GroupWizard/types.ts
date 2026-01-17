import { DateBoundary } from '../Pages/GroupTemplates/types';

export enum EMode {
  CreateTemplate = 'create-template',
  EditTemplate = 'edit-template',
  CreateGroup = 'create-group',
  EditGroup = 'edit-group',
}

export interface GroupData {
  groupId?: number;
  groupName?: string;
  baseTemplateName?: string;
  cost: number;
  unitCost: number;
  startHour?: string;
  lessonLength?: string;
  startDateTime?: string;
  roomId?: number;
  teacherId?: number;
  isActive: boolean;
  comment: string;
  studentIds: Array<number>;
  classIds: Array<number>;
  colorHex?: string;
}

export interface TemplateData {
  templateId?: number;
  templateName: string;  
  cost: number;
  unitCost: number;
  minStartDate?: DateBoundary;
  maxEndDate?: DateBoundary;
  includeYear?: boolean;
  startHour?: string;
  lessonLength?: string;
  roomId?: number;
  teacherId?: number;
  comment: string;
  courseId?: number;
  colorHex?: string;
}

export type GroupWizardData = GroupData & TemplateData;

export interface GroupWizardProps {
  open: boolean;

  mode: EMode;
  id?: number;

  onSuccess?: () => void;
  onClose: () => void;
}
