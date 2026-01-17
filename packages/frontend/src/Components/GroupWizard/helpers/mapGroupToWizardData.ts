import { GroupWizardData } from '../types';
import { Group } from '../../Pages/Groups/types';

export const mapGroupToWizardData = (group: Group): GroupWizardData => ({
  templateId: undefined,
  groupName: group.name,
  templateName: group.baseTemplateName || group.name || '',
  baseTemplateName: group.baseTemplateName || '',
  cost: group.cost,
  unitCost: group.unitCost,
  minStartDate: group.minStartDate,
  maxEndDate: group.maxEndDate,
  includeYear: !!(group.minStartDate?.year || group.maxEndDate?.year),
  startHour: typeof group.startHour === 'string' ? group.startHour : '09:00',
  lessonLength: typeof group.lessonLength === 'string' ? group.lessonLength : '01:00',
  roomId: group.roomId ?? undefined,
  teacherId: group.teacherId ?? undefined,
  isActive: group.isActive,
  comment: group.comment || '',
  studentIds: (group.studentIds || []).map((id) => Number(id)),
  classIds: (group.classIds || []).map((id) => Number(id)),
  courseId: group.courseId ?? undefined,
  colorHex: group.colorHex ?? undefined,
});
