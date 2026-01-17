import React from 'react';
import { groupTemplatesApi } from '../../../api/endpoints/groupTemplates';
import { GroupWizardData } from '../types';

type SetLoading = React.Dispatch<React.SetStateAction<boolean>>;
type SetError = React.Dispatch<React.SetStateAction<string | null>>;

type Params = {
  formData: GroupWizardData;
  allTemplates: any[];
  groupTemplateId?: number;
  setLoading: SetLoading;
  setError: SetError;
  onSuccess?: () => void;
  handleClose: () => void;
};

export const createHandleSaveTemplate = ({
  formData,
  allTemplates,
  groupTemplateId,
  setLoading,
  setError,
  onSuccess,
  handleClose,
}: Params) => async () => {
  try {
    setLoading(true);
    setError(null);

    if (!formData.templateName?.trim()) {
      setError('Nazwa szablonu jest wymagana');
      setLoading(false);
      return;
    }

    const isDuplicate = allTemplates.some(
      (template: any) =>
        template.templateName.toLowerCase() === formData.templateName.toLowerCase() &&
        template.id !== groupTemplateId
    );

    if (isDuplicate) {
      setError('Szablon o tej nazwie już istnieje. Wybierz inną nazwę.');
      setLoading(false);
      return;
    }

    const templateData = {
      templateName: formData.templateName,
      isActive: formData.isActive,
      cost: formData.cost,
      unitCost: formData.unitCost,
      studentIds: formData.studentIds,
      classIds: formData.classIds,
      teacherId: formData.teacherId,
      comment: formData.comment,
      minStartDate: formData.minStartDate,
      maxEndDate: formData.maxEndDate,
      color: formData.colorHex,
      lessonLength: formData.lessonLength,
      startHour: formData.startHour,
      roomId: formData.roomId,
      courseId: formData.courseId,
    };

    if (groupTemplateId) {
      await groupTemplatesApi.updateGroupTemplate(groupTemplateId, templateData);
    } else {
      await groupTemplatesApi.createGroupTemplate(templateData as any);
    }

    onSuccess?.();
    handleClose();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania szablonu');
    console.error('Error saving group template:', err);
  } finally {
    setLoading(false);
  }
};
