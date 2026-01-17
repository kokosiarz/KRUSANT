export interface StepTeacherProps {
  teacherId?: number;
  setTeacherId: (id: number | undefined) => void;
  teacherList: any[];
  compact?: boolean;
}
