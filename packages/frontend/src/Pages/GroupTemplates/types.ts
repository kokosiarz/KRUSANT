export interface DateBoundary {
  day: number;
  month: number;
  year?: number;
}

export interface ColumnConfig {
  id: string;
  label: string;
  render: (template: GroupTemplate) => React.ReactNode;
  width?: number;
}

export interface GroupTemplate {
  id: number;
  templateName: string;
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
  startHour?: string;
  lessonLength?: string;
  roomId?: number;
  courseId?: number;
  numberOfHours?: number;
}
