export enum EDateMode {
  date,
  startDate,
  endDate
}

export interface StepDateProps {
  mode: EDateMode;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  setDate: (date: Date) => void;
}
