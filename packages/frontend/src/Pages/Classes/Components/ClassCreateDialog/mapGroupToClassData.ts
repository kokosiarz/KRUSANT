import type { Class as ClassItem } from '@/api/endpoints/classes';
import type { Group } from '@/Pages/Groups/types';
import { calculateCost } from './utils';

export function mapGroupToClassData(group: Group, date: string, hour: string): Partial<ClassItem> {
  // Example mapping logic, adjust as needed
  return {
    groupId: group.id,
    startTime: date, // ISO string
    lessonLength: group.lessonLength,
    teacherId: group.teacherId,
    roomId: group.roomId,
    cost: calculateCost(group.lessonLength, group.unitCost) ?? group.unitCost,
    plannedStudentsIds: group.studentIds.map(id => Number(id)),
    // Add more fields as needed
  };
}
