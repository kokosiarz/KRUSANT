import React from 'react';
import { GroupWizardData } from '../types';

type SetFormData = React.Dispatch<React.SetStateAction<GroupWizardData>>;

export const createHandleYearToggle = (
  formData: GroupWizardData,
  setFormData: SetFormData,
) => () => {
  const newIncludeYear = !formData.includeYear;
  setFormData((prev: GroupWizardData) => {
    const updatedData: GroupWizardData = {
      ...prev,
      includeYear: newIncludeYear,
    };

    if (newIncludeYear) {
      if (prev.minStartDate) {
        updatedData.minStartDate = {
          ...prev.minStartDate,
          year: prev.minStartDate.year || new Date().getFullYear(),
        };
      }
      if (prev.maxEndDate) {
        updatedData.maxEndDate = {
          ...prev.maxEndDate,
          year: prev.maxEndDate.year || new Date().getFullYear(),
        };
      }
    } else {
      if (prev.minStartDate) {
        updatedData.minStartDate = {
          day: prev.minStartDate.day,
          month: prev.minStartDate.month,
        };
      }
      if (prev.maxEndDate) {
        updatedData.maxEndDate = {
          day: prev.maxEndDate.day,
          month: prev.maxEndDate.month,
        };
      }
    }

    return updatedData;
  });
};
