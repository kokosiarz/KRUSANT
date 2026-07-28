import React from 'react';
import { useGroupWizardData } from '@components/GroupWizard/Context/GroupWizardDataContext';
import TemplatePicker from '../../Components/TemplatePicker';
import { useQuery } from '@tanstack/react-query';
import { groupTemplatesApi } from '@/api/endpoints/groupTemplates';
import LoadingErrorHandler from '@/Components/Common/LoadingErrorHandler';


// Component that wraps TemplatePicker and connects it to the GroupWizardDataContext
// Select template that group will be based on. Used only in GROUP CREATION mode.
export const TemplateSelectorWrapper: React.FC = () => {
  const { formData, setFormData } = useGroupWizardData();
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['groupTemplates'],
    queryFn: groupTemplatesApi.getGroupTemplates,
  });


  const setTemplateId = (id: number) => {
    // Find the selected template by id
    const t = templates.find((template: any) => template.id === id);
    if (!t) return;
    // Inherit everything the template describes about the group pattern
    // (schedule, cost, teacher/room/course) — deliberately NOT studentIds/
    // classIds, since a new group starts with its own fresh roster rather
    // than cloning whichever students happened to be on the template.
    setFormData({
      ...formData,
      templateId: id,
      baseTemplateName: t.templateName || '',
      groupName: t.templateName || '',
      cost: t.cost !== undefined ? t.cost : formData.cost,
      unitCost: t.unitCost !== undefined ? t.unitCost : formData.unitCost,
      colorHex: t.colorHex ? t.colorHex : formData.colorHex,
      numberOfHours: t.numberOfHours !== undefined ? t.numberOfHours : formData.numberOfHours,
      courseId: t.courseId !== undefined ? t.courseId : formData.courseId,
      teacherId: t.teacherId !== undefined ? t.teacherId : formData.teacherId,
      roomId: t.roomId !== undefined ? t.roomId : formData.roomId,
      startHour: t.startHour ? t.startHour : formData.startHour,
      lessonLength: t.lessonLength ? t.lessonLength : formData.lessonLength,
      minStartDate: t.minStartDate ? t.minStartDate : formData.minStartDate,
      maxEndDate: t.maxEndDate ? t.maxEndDate : formData.maxEndDate,
      comment: t.comment !== undefined ? t.comment : formData.comment,
    });
  };

  return (
    <LoadingErrorHandler loading={isLoading} error={error?.message}>
      <TemplatePicker
        templates={templates}
        selectedTemplateId={formData.templateId}
        setTemplateId={setTemplateId}
      />
    </LoadingErrorHandler>
  );
};

export default TemplateSelectorWrapper;