export interface Course {
  id: number;
  name: string;
  description?: string;
  cost: number;
  numberOfHours: number;
  lessonLength: string;
  pattern: 'workdays' | 'weekly';
}
