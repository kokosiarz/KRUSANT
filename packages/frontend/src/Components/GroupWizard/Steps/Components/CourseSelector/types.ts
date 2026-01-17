import { Course } from '../../../../../api/types/course';

export interface StepCourseProps {
  courses: Course[];
  courseId?: number;
  setCourseId: (id: number | undefined) => void;
}
