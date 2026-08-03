import dayjs from 'dayjs';
import { GroupWizardData, TemplateData, GroupData, EMode } from './types';
import { EStep } from './Steps/types';
import { Group } from '../../Pages/Groups/types';

export type ValidationResult = string | null;

/**
 * Extra data a validator may need beyond the form itself. `id` is the entity
 * being edited, so a name only collides with *other* groups/templates.
 */
export interface ValidationContext {
  allTemplates?: TemplateData[];
  allGroups?: Group[];
  id?: number;
}

// Per-field validation rules
export const validators: Record<EStep, (data: GroupWizardData, mode: EMode, context?: ValidationContext) => ValidationResult> = {
  [EStep.Template]: () => null,
  [EStep.Course]: (data) => data.courseId ? null : 'Wybierz kurs',
  [EStep.Name]: (data, mode, ctx) => {
    if (mode === EMode.CreateGroup || mode === EMode.EditGroup) {
      const { groupName } = data as GroupData;
      if (!groupName?.trim()) return 'Nazwa grupy jest wymagana';
      if (ctx?.allGroups) {
        const isDuplicate = ctx.allGroups.some(
          (g) => g.name.toLowerCase() === groupName.toLowerCase() && g.id !== ctx.id
        );
        if (isDuplicate) return 'Grupa o tej nazwie już istnieje. Wybierz inną nazwę.';
      }
      return null;
    }
    if (!(data as TemplateData).templateName?.trim()) return 'Nazwa szablonu jest wymagana';
    if (ctx?.allTemplates && (data as TemplateData).templateName) {
      const isDuplicate = ctx.allTemplates.some(
        (t) => t.templateName.toLowerCase() === (data as TemplateData).templateName.toLowerCase() && t.templateId !== ctx.id
      );
      if (isDuplicate) return 'Szablon o tej nazwie już istnieje. Wybierz inną nazwę.';
    }
    return null;
  },
  [EStep.Color]: (data) => data.colorHex ? null : 'Kolor jest wymagany',
  [EStep.CostBase]: (data) => {
    if (data.cost === undefined || data.cost === null || isNaN(Number(data.cost))) return 'Koszt bazowy jest wymagany';
    if (Number(data.cost) < 0) return 'Koszt bazowy nie może być ujemny';
    return null;
  },
  [EStep.CostUnit]: (data) => {
    if (data.unitCost === undefined || data.unitCost === null || isNaN(Number(data.unitCost))) return 'Koszt jednostkowy jest wymagany';
    if (Number(data.unitCost) < 0) return 'Koszt jednostkowy nie może być ujemny';
    return null;
  },
  [EStep.DateStart]: (data) => data.minStartDate ? null : 'Data startu jest wymagana',
  [EStep.DateEnd]: (data) => {
    if ((data as TemplateData).includeYear && (data as TemplateData).minStartDate && (data as TemplateData).maxEndDate) {
      const { minStartDate, maxEndDate } = data as TemplateData;
      if (minStartDate?.year && maxEndDate?.year) {
        const startDate = dayjs(`${minStartDate.year}-${String(minStartDate.month).padStart(2, '0')}-${String(minStartDate.day).padStart(2, '0')}`);
        const endDate = dayjs(`${maxEndDate.year}-${String(maxEndDate.month).padStart(2, '0')}-${String(maxEndDate.day).padStart(2, '0')}`);
        if (!endDate.isAfter(startDate)) return 'Data końca musi być po dacie startu';
      }
    }
    return null;
  },
  [EStep.LessonLength]: (data) => data.lessonLength ? null : 'Długość spotkania jest wymagana',
  [EStep.Teacher]: (data) => data.teacherId ? null : 'Nauczyciel jest wymagany',
  // Optional steps:
  [EStep.StartHour]: () => null,
  [EStep.Room]: () => null,
  [EStep.Students]: () => null,
  [EStep.Summary]: () => null,
};

export function validateStep(step: EStep, data: GroupWizardData, mode: EMode, context?: ValidationContext): ValidationResult {
  const validator = validators[step];
  return validator ? validator(data, mode, context) : null;
}

export function validateAllMandatory(steps: { step: EStep, isMandatory?: boolean }[], data: GroupWizardData, mode: EMode, context?: ValidationContext): ValidationResult {
  for (const s of steps) {
    if (!s.isMandatory) continue;
    const error = validateStep(s.step, data, mode, context);
    if (error) return error;
  }
  return null;
}
