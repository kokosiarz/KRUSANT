import dayjs from 'dayjs';
import { GroupWizardData } from '../types';

type Params = {
  currentStep: number;
  formData: GroupWizardData;
  allTemplates: any[];
  groupTemplateId?: number;
};

export const canContinue = ({ currentStep, formData, allTemplates, groupTemplateId }: Params) => {
  if (currentStep === 0) return !!formData.courseId;
  if (currentStep === 1) {
    if (formData.templateName.trim().length === 0) return false;
    const isDuplicate = allTemplates.some(
      (template: any) =>
        template.templateName.toLowerCase() === formData.templateName.toLowerCase() &&
        template.id !== groupTemplateId
    );
    return !isDuplicate;
  }
  if (currentStep === 5 && formData.includeYear && formData.minStartDate && formData.maxEndDate) {
    if (formData.minStartDate.year && formData.maxEndDate.year) {
      const startDate = dayjs(
        `${formData.minStartDate.year}-${String(formData.minStartDate.month).padStart(2, '0')}-${String(
          formData.minStartDate.day
        ).padStart(2, '0')}`
      );
      const endDate = dayjs(
        `${formData.maxEndDate.year}-${String(formData.maxEndDate.month).padStart(2, '0')}-${String(
          formData.maxEndDate.day
        ).padStart(2, '0')}`
      );
      return endDate.isAfter(startDate);
    }
  }
  return true;
};
