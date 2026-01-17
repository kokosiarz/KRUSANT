import { Dayjs } from 'dayjs';

export type StepClassesProps = {
  proposedDates: string[];
  proposedDateObjects: Dayjs[];
  onDateChange: (idx: number, newValue: Dayjs | null) => void;
  onDateRemove: (idx: number) => void;
  mode?: 'template' | 'group';
};
