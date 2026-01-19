import { GroupWizardData } from '../types';
import { GroupTemplate } from '../../../Pages/GroupTemplates/types';

export const mapTemplateToWizardData = (template: GroupTemplate): GroupWizardData => ({
  templateName: template.templateName,
  cost: template.cost,
  unitCost: template.unitCost,
  minStartDate: template.minStartDate,
  maxEndDate: template.maxEndDate,
  includeYear: template.minStartDate?.year !== undefined || template.maxEndDate?.year !== undefined,
  startHour: typeof template.startHour === 'string' ? template.startHour : '09:00',
  lessonLength: typeof template.lessonLength === 'string' ? template.lessonLength : '01:00',
  roomId: template.roomId ?? undefined,
  teacherId: template.teacherId ?? undefined,
  isActive: template.isActive,
  comment: template.comment || '',
  studentIds: (template.studentIds || []).map((id: number | string) => Number(id)),
  classIds: (template.classIds || []).map((id: number | string) => Number(id)),
  courseId: template.courseId ?? undefined,
  colorHex: template.colorHex ?? undefined,
});
