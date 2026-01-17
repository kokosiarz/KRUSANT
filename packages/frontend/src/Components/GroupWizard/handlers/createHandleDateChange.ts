import React from 'react';
import { Dayjs } from 'dayjs';
import { GroupWizardData } from '../types';

type SetFormData = React.Dispatch<React.SetStateAction<GroupWizardData>>;

type DateField = 'minStartDate' | 'maxEndDate';

export const createHandleDateChange = (
  formData: GroupWizardData,
  setFormData: SetFormData,
) => (newDate: Dayjs | null, dateField: DateField) => {
  if (!newDate) return;

  const boundary = {
    day: newDate.date(),
    month: newDate.month() + 1,
    year: formData.includeYear ? newDate.year() : undefined,
  };

  setFormData((prev: GroupWizardData) => ({
    ...prev,
    [dateField]: boundary,
  }));
};
