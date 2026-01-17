
import { EMode, GroupData, GroupWizardData, TemplateData } from '../Components/GroupWizard/types';
import { EStep } from '../Components/GroupWizard/Steps/types';
import { isTemplateNameEmpty, isDuplicateTemplateName } from '../Components/GroupWizard/validation';

// TODO refactor and get rid of duplication with validationSchema.ts
export const useWizardValidation = (
  formData: GroupWizardData,
  allTemplates: TemplateData[],
  id: number | undefined,
  mode: EMode
) => {
  const templateNameEmpty = isTemplateNameEmpty((formData as TemplateData)?.templateName || '');
  const duplicateTemplateName = isDuplicateTemplateName((formData as TemplateData)?.templateName || '', allTemplates, id);

  const canContinue = (step: EStep): boolean => {
    switch (step) {
      case EStep.Template:
        return true;
      case EStep.Course:
        return !!(formData as TemplateData).courseId;
      case EStep.Name:
        if (mode === EMode.CreateGroup || mode === EMode.EditGroup) {
          return !!(formData as GroupData).groupName?.trim();
        }
        if (templateNameEmpty) return false;
        return !duplicateTemplateName;
      case EStep.DateEnd:
        if ((formData as TemplateData).includeYear && (formData as TemplateData).minStartDate && (formData as TemplateData).maxEndDate) {
          const { minStartDate, maxEndDate } = formData as TemplateData;
          if (minStartDate?.year && maxEndDate?.year) {
            const dayjs = require('dayjs');
            const startDate = dayjs(`${minStartDate.year}-${String(minStartDate.month).padStart(2, '0')}-${String(minStartDate.day).padStart(2, '0')}`);
            const endDate = dayjs(`${maxEndDate.year}-${String(maxEndDate.month).padStart(2, '0')}-${String(maxEndDate.day).padStart(2, '0')}`);
            return endDate.isAfter(startDate);
          }
        }
        return true;
      default:
        return true;
    }
  };

  const getValidationError = (step: EStep): string | null => {
    switch (step) {
      case EStep.Course:
        return (formData as TemplateData).courseId ? null : 'Wybierz kurs';
      case EStep.Name:
        if (mode === EMode.CreateGroup || mode === EMode.EditGroup) {
          return (formData as GroupData).groupName?.trim() ? null : 'Nazwa grupy jest wymagana';
        }
        if (templateNameEmpty) return 'Nazwa szablonu jest wymagana';
        if (duplicateTemplateName) return 'Szablon o tej nazwie już istnieje. Wybierz inną nazwę.';
        return null;
      case EStep.DateEnd:
        return 'Data końca musi być po dacie startu';
      default:
        return null;
    }
  };

  return { canContinue, getValidationError, templateNameEmpty, duplicateTemplateName };
};
