export interface DateBoundary {
  day: number;
  month: number;
  year?: number;
}

export interface Group {
  id: number;
  name: string;
  isActive: boolean;
  studentIds: Array<number | string>;
  classIds: Array<number | string>;
  cost: number;
  unitCost: number;
  teacherId?: number;
  comment: string;
  minStartDate?: DateBoundary;
  maxEndDate?: DateBoundary;
  colorHex?: string;
  baseTemplateName?: string;
  courseId?: number;
  roomId?: number;
  startHour?: string;
  lessonLength?: string;
  numberOfHours?: number;
}
