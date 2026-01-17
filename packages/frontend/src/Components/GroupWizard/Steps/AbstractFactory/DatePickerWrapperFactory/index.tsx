import React from 'react';
import { useGroupWizardData } from '@components/GroupWizard/Context/GroupWizardDataContext';
import DatePicker from '../../../../Common/DatePicker';
import { EDateMode } from '../../../../Common/DatePicker/types';

const DatePickerWrapper: React.FC<{ mode: EDateMode, minDate?: Date, maxDate?: Date }> = ({ mode, minDate, maxDate }) => {
  const { formData, setFormData } = useGroupWizardData();

  // Helper to convert Date to DateBoundary
  const toDateBoundary = (date: Date, includeYear: boolean): { day: number; month: number; year?: number } => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return includeYear ? { day: d, month: m, year: y } : { day: d, month: m };
  };

  // Helper to convert DateBoundary to Date
  const fromDateBoundary = (boundary?: { day: number; month: number; year?: number }): Date | undefined => {
    if (!boundary) return undefined;
    const y = boundary.year ?? new Date().getFullYear(); // fallback year is now current year
    return new Date(y, boundary.month - 1, boundary.day);
  };

  const includeYear = !!formData.includeYear;

  // Combine setDate and selectedDate logic for improved readability
  const getDateHandlers = () => {
    if (mode === EDateMode.startDate) {
      return {
        selectedDate: fromDateBoundary(formData.minStartDate),
        setDate: (date: Date) => setFormData({ ...formData, minStartDate: toDateBoundary(date, includeYear) })
      };
    } else if (mode === EDateMode.endDate) {
      return {
        selectedDate: fromDateBoundary(formData.maxEndDate),
        setDate: (date: Date) => setFormData({ ...formData, maxEndDate: toDateBoundary(date, includeYear) })
      };
    } else if (mode === EDateMode.date) {
      return {
        selectedDate: formData.startDateTime ? new Date(formData.startDateTime) : undefined,
        setDate: (date: Date) => setFormData({ ...formData, startDateTime: date.toISOString() })
      };
    }
    return { selectedDate: undefined, setDate: () => {} };
  };

  const { selectedDate, setDate } = getDateHandlers();

  return (
    <DatePicker
      mode={mode}
      selectedDate={selectedDate}
      minDate={minDate}
      maxDate={maxDate}
      setDate={setDate}
    />
  );
};

export default DatePickerWrapper;
