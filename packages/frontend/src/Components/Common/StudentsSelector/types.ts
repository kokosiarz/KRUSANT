import { Student } from '@pages/Students/types';

export interface StudentsSelectorProps {
  studentIds: number[];
  setStudentIds: (ids: number[]) => void;
  disabled?: boolean;
  showInactive?: boolean;
}
