export type CoursePattern =
  | 'workdays'
  | 'weekends'
  | 'everyday'
  | 'weekly'
  | 'biweekly'
  | 'monthly';

export interface Course {
  id: number;
  name: string;
  description?: string;
  cost: number;
  numberOfHours: number;
  lessonLength: string;
  pattern: CoursePattern;
}
