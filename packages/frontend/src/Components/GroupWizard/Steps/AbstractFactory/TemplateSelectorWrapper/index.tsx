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
    const selectedTemplate = templates.find((t: any) => t.id === id);
    setFormData({
      ...formData,
      templateId: id,
      baseTemplateName: selectedTemplate?.templateName || '',
      groupName: selectedTemplate?.templateName || '',
      cost: selectedTemplate?.cost !== undefined ? selectedTemplate.cost : formData.cost,
      unitCost: selectedTemplate?.unitCost !== undefined ? selectedTemplate.unitCost : formData.unitCost,
      colorHex: selectedTemplate?.colorHex ? selectedTemplate.colorHex : formData.colorHex,
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