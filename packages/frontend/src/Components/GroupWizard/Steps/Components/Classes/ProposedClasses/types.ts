export interface ProposedClassesProps {
  proposedDates: string[];
  proposedDateObjects: Date[];
  onDateChange: (index: number, newDate: Date) => void;
  onDateRemove: (index: number) => void;
}
